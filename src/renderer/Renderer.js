import { RendererContext } from './RendererContext.js';
import FinalShader from '../shader/FinalShader.js';
import { Logger } from '../Logger.js';
import Config from '../Config.js';
import { mat4, vec3 } from 'gl-matrix';
import { Vec } from '../Math.js';
import { Pointlight } from '../light/Pointlight';
import { Geometry } from '../scene/Geometry';
import { Grid } from '../geo/Grid.js';
import { Texture } from '../materials/Texture.js';
import NormalShader from '../shader/NormalShader.js';
import WorldShader from '../shader/WorldShader.js';

Config.global.define('show.grid', false, false);

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

		this.grid = new Grid(100, 14);
		this.showGrid = Config.global.getValue('show.grid');

		this.lightDirection = [500.0, 250.0, 300.0];
		this.ambientLight = 0.85;
		this.background = [0.08, 0.08, 0.08, 1.0];
		this.shadowMapSize = 4096;

		this.renderTarget = new Screen();
		this.compShader = new FinalShader();
	}

	setResolution(width, height) {
		super.setResolution(width, height);

		this.updateViewport();

		this.renderPasses = [
			new RenderPass(this, 'shadow', null, this.aspectratio, this.shadowMapSize),
			new RenderPass(this, 'world', new WorldShader(), this.aspectratio, width),
			new RenderPass(this, 'normal', new NormalShader(), this.aspectratio, width),
			new RenderPass(this, 'color', null, this.aspectratio, width),
		];

		logger.log(`Resolution set to ${this.width}x${this.height}`);
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

			if (pass.id == "shadow") {
				const shadowCamera = this.scene.lightSources;
				this.drawScene(this.scene, shadowCamera, null, pass.shader != null);

			} else {
				this.drawScene(this.scene, camera, null, pass.shader != null);
			}

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

		const shadowProjViewMat = this.scene.lightSources.projViewMatrix;
		this.gl.uniformMatrix4fv(this.currentShader.uniforms["shadowProjViewMat"], false, shadowProjViewMat);

		this.gl.uniform1f(this.currentShader.uniforms.ambientLight, this.ambientLight);
		this.gl.uniform3fv(this.currentShader.uniforms.lightDirection, this.lightDirection);

		// push pass frame buffers to comp
		for (let pass of this.renderPasses) {
			this.useTextureBuffer(this.getBufferTexture(pass.id), gl.TEXTURE_2D, pass.id + 'Buffer', this.renderPasses.indexOf(pass));
		}
		// push depth from color buffer
		this.useTextureBuffer(this.getBufferTexture('color.depth'), gl.TEXTURE_2D, 'depthBuffer', this.renderPasses.length);

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

		this.currentShader.setUniforms(this, material.attributes, 'material');
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
				this.drawMesh(obj, camera, shaderOverwrite);
			}
		}

		if (this.showGrid) {
			this.drawMesh(this.grid, camera);
		}
	}

	drawMesh(geo, camera, shaderOverwrite) {
		if (geo.material) {

			if (!shaderOverwrite) {
				this.useShader(geo.material.shader);
			}
			this.applyMaterial(geo.material);

			this.gl.uniformMatrix4fv(this.currentShader.uniforms["scene.projection"], false, camera.projMatrix);
			this.gl.uniformMatrix4fv(this.currentShader.uniforms["scene.view"], false, camera.viewMatrix);

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

		gl.drawArraysInstanced(gl[this.currentShader.drawmode], 0, vertCount, geo.instances);
	}

	drawGeo(geo) {
		const gl = this.gl;
		const buffer = geo.buffer;

		this.setupGemoetry(geo);

		if (buffer.indecies.length > 0) {
			gl.drawElements(gl[this.currentShader.drawmode], buffer.indecies.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawArrays(gl[this.currentShader.drawmode], 0, buffer.vertecies.length / buffer.elements);
		}
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
