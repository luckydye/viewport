import { RendererContext } from './RendererContext.js';
import FinalShader from '../shader/FinalShader.js';
import ColorShader from '../shader/ColorShader.js';
import PrimitiveShader from '../shader/PrimitiveShader.js';
import { Logger } from '../Logger.js';
import Config from '../Config.js';
import { mat4, vec3 } from 'gl-matrix';
import { Vec } from '../Math.js';
import MattShader from '../shader/MattShader.js';
import { Pointlight } from '../light/Pointlight';
import NormalShader from './../shader/NormalShader.js';
import { Geometry } from '../scene/Geometry';
import WorldShader from './../shader/WorldShader.js';
import UVShader from './../shader/UVShader.js';
import SpecularShader from './../shader/SpecularShader.js';
import { Grid } from '../geo/Grid.js';
import { Texture } from '../materials/Texture.js';

const logger = new Logger('Renderer'), log = logger.log;

class Screen extends Geometry {
	static get attributes() {
		return [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
		]
	}
	get vertecies() {
		return [
			-1, -1, 0, 0, 0,
			1, -1, 0, 1, 0,
			1, 1, 0, 1, 1,
			1, 1, 0, 1, 1,
			-1, 1, 0, 0, 1,
			-1, -1, 0, 0, 0,
		]
	}
}

export class Renderer extends RendererContext {

	static get defaults() {
		return {
			resolution: [
				1280,
				720
			]
		}
	}

	setScene(scene) {
		this.scene = scene;
		this.updateViewport();
	}

	updateViewport() {
		this.scene.activeCamera.sensor = {
			width: this.width,
			height: this.height
		};
	}

	onCreate() {

		this.grid = new Grid(100, 12);
		this.showGrid = true;

		this.lightDirection = [500.0, 250.0, 300.0];
		this.ambientLight = 0.85;
		this.background = [0.08, 0.08, 0.08, 1.0];
		this.renderTarget = new Screen();

		this.shadowMapSize = 4096;

		this.setResolution(this.width, this.height);

		this.compShader = new FinalShader();

		logger.log(`Resolution set to ${this.width}x${this.height}`);
	}

	setResolution(width, height) {
		super.setResolution(width, height);

		this.renderPasses = [
			// new RenderPass(this, 'shadow', new ColorShader(), this.aspectratio, this.shadowMapSize, true),
			// new RenderPass(this, 'uv', new UVShader(), this.aspectratio, renderRes),
			// new RenderPass(this, 'spec', new SpecularShader(), this.aspectratio, renderRes),
			// new RenderPass(this, 'world', new WorldShader(), this.aspectratio, renderRes),
			// new RenderPass(this, 'normal', new NormalShader(), this.aspectratio, renderRes),
			new RenderPass(this, 'color', null, this.aspectratio, this.width),
		];
	}

	draw() {
		this.renderRenderPasses();
		this.compositeRenderPasses();
	}

	renderRenderPasses() {
		const gl = this.gl;
		const camera = this.scene.activeCamera;

		for (let pass of this.renderPasses) {

			pass.use();

			gl.clearColor(0, 0, 0, 0);
			this.clear();

			this.drawScene(this.scene, camera, null, pass.shader != null);

			this.clearFramebuffer();
		}
	}

	preComposition() {
		// composition hook
	}

	compositeRenderPasses() {
		const gl = this.gl;

		gl.clearColor(...this.background);
		this.clear();

		this.useShader(this.compShader);

		let lightCount = 0;
		for (let light of this.scene.objects) {
			if (light instanceof Pointlight) {

				this.gl.uniform3fv(this.compShader.uniforms["lights[" + lightCount + "].position"], [
					light.position.x,
					light.position.y,
					light.position.z,
				]);

				this.gl.uniform3fv(this.compShader.uniforms["lights[" + lightCount + "].color"], light.color);
				this.gl.uniform1f(this.compShader.uniforms["lights[" + lightCount + "].intensity"], light.intensity);
				this.gl.uniform1f(this.compShader.uniforms["lights[" + lightCount + "].size"], light.size);
				lightCount++;
			}
		}

		this.gl.uniform3fv(this.currentShader.uniforms.lightDirection, this.lightDirection);
		this.gl.uniform1f(this.currentShader.uniforms.ambientLight, this.ambientLight);

		this.useTextureBuffer(this.getBufferTexture('color.depth'), gl.TEXTURE_2D, 'depthBuffer', 0);
		this.useTextureBuffer(this.getBufferTexture('color'), gl.TEXTURE_2D, 'colorBuffer', 1);

		this.preComposition();

		this.drawGeo(this.renderTarget);
	}

	// give texture a .gltexture
	prepareTexture(texture) {
		if (!texture.gltexture) {
			texture.gltexture = this.createTexture(texture.image);
		}
	}

	// use a Texture
	useTexture(texture, uniformStr, slot) {
		const gltexture = texture ? texture.gltexture : null;
		const type = texture ? this.gl[texture.type] : null;
		this.useTextureBuffer(gltexture, type, uniformStr, slot);
	}

	// give material attributes to shader
	applyMaterial(material) {

		// update textures
		if (material && material.animated) {
			if (material.texture && material.texture.image) {
				this.updateTextureBuffer(material.texture.gltexture, material.texture.image);
			}
			if (material.specularMap && material.specularMap.image) {
				this.updateTextureBuffer(material.specularMap.gltexture, material.specularMap.image);
			}
			if (material.normalMap && material.normalMap.image) {
				this.updateTextureBuffer(material.normalMap.gltexture, material.normalMap.image);
			}
			if (material.displacementMap && material.displacementMap.image) {
				this.updateTextureBuffer(material.displacementMap.gltexture, material.displacementMap.image);
			}
		}

		this.currentShader.setUniforms(this, material, 'material');
	}

	setupGemoetry(geo) {
		this.initializeBuffersAndAttributes(geo.buffer);

		geo.modelMatrix = geo.modelMatrix || mat4.create();
		const modelMatrix = geo.modelMatrix;

		const position = Vec.add(geo.position, geo.origin);
		const rotation = geo.rotation;
		const scale = geo.scale;

		mat4.identity(modelMatrix);

		mat4.translate(modelMatrix, modelMatrix, position);

		mat4.rotateX(modelMatrix, modelMatrix, rotation.x);
		mat4.rotateY(modelMatrix, modelMatrix, rotation.y);
		mat4.rotateZ(modelMatrix, modelMatrix, rotation.z);

		mat4.scale(modelMatrix, modelMatrix, new Vec(scale, scale, scale));

		this.gl.uniformMatrix4fv(this.currentShader.uniforms["scene.model"], false, modelMatrix);
	}

	drawScene(scene, camera, filter, shaderOverwrite) {
		const objects = scene.getRenderableObjects();

		for (let obj of objects) {
			if (filter && filter(obj) || !filter) {
				this.drawMesh(obj, shaderOverwrite);
			}
		}
	}

	drawMesh(geo, shaderOverwrite) {
		if (geo.material) {

			if (!shaderOverwrite) {
				this.useShader(geo.material.shader);
			}
			this.applyMaterial(geo.material);

			const shader = this.currentShader;

			this.gl.uniformMatrix4fv(shader.uniforms["scene.projection"], false, camera.projMatrix);
			this.gl.uniformMatrix4fv(shader.uniforms["scene.view"], false, camera.viewMatrix);

			this.gl.uniform3fv(shader.uniforms.cameraPosition, [
				camera.worldPosition.x,
				camera.worldPosition.y,
				camera.worldPosition.z,
			]);

			if (geo.instanced) {
				this.drawGeoInstanced(geo);
			} else {
				this.drawGeo(geo);
			}
		}
	}

	drawGeoInstanced(geo) {
		const gl = this.gl;
		const buffer = geo.buffer;
		const vertCount = buffer.vertecies.length / buffer.elements;

		this.setupGemoetry(geo);

		gl.drawArraysInstanced(gl[buffer.type], 0, vertCount, geo.instances);
	}

	drawGeo(geo) {
		const gl = this.gl;
		const buffer = geo.buffer;

		this.setupGemoetry(geo);

		if (buffer.indecies.length > 0) {
			gl.drawElements(gl[buffer.type], buffer.indecies.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawArrays(gl[buffer.type], 0, buffer.vertecies.length / buffer.elements);
		}
	}

	renderCubemap(cubemap, camera) {
		const gl = this.gl;

		const initial = {
			rotation: new Vec(camera.rotation),
			position: new Vec(camera.position),
		};

		const shader = new ColorShader();
		this.useShader(shader);

		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
		for (let f = 0; f < 6; f++) {
			const target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + f;
			gl.texImage2D(target, 0, gl.RGBA, cubemap.width, cubemap.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		const faces = [
			{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, rotation: new Vec(0, -90 / 180 * Math.PI, 0) },
			{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, rotation: new Vec(0, 90 / 180 * Math.PI, 0) },

			{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, rotation: new Vec(-90 / 180 * Math.PI, 0, 0) },
			{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, rotation: new Vec(90 / 180 * Math.PI, 0, 0) },

			{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, rotation: new Vec(0, 180 / 180 * Math.PI, 0) },
			{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, rotation: new Vec(0, 0, 0) },
		];

		cubemap.gltexture = texture;

		const fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		for (let face of faces) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, face.target, texture, 0);

			camera.position.x = 0;
			camera.position.y = -650;
			camera.position.z = 0;

			camera.rotation.x = face.rotation.x;
			camera.rotation.y = face.rotation.y;
			camera.rotation.z = face.rotation.z;

			camera.fov = 75;

			camera.update();

			this.setResolution(cubemap.width, cubemap.height);
			this.updateViewport();

			this.clear();
			this.drawScene(this.scene, camera);
		}

		camera.position.x = initial.position.x;
		camera.position.y = initial.position.y;
		camera.position.z = initial.position.z;

		camera.rotation.x = initial.rotation.x;
		camera.rotation.y = initial.rotation.y;
		camera.rotation.z = initial.rotation.z;

		camera.fov = 90;

		this.setResolution(window.innerWidth, window.innerHeight);
		this.updateViewport();
	}

}

export class RenderPass {

	get buffer() {
		return this.renderer.getBufferTexture(this.id);
	}

	get depthbuffer() {
		return this.renderer.getBufferTexture(this.id + '.depth');
	}

	constructor(renderer, id, shaderOverwrite, ar, resolution, isDepthBuffer) {
		this.id = id;
		this.shader = shaderOverwrite;
		this.renderer = renderer;

		this.width = resolution;
		this.height = resolution / ar;

		this.fbo = null;

		if (isDepthBuffer) {
			this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).depthbuffer();
		} else {
			this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).colorbuffer();
		}
	}

	use() {
		this.renderer.useFramebuffer(this.id);
		this.renderer.viewport(this.width, this.height);

		if (this.shader) {
			this.renderer.useShader(this.shader);
		}
	}
}
