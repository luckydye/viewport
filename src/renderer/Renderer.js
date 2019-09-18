import { RendererContext } from './RendererContext.js';
import CompShader from '../shader/CompShader.js';
import { Logger } from '../Logger.js';
import Config from '../Config.js';
import { mat4, glMatrix } from 'gl-matrix';
import { Vec } from '../Math.js';
import { Pointlight } from '../light/Pointlight.js';
import { Geometry } from '../scene/Geometry.js';
import { Grid } from '../geo/Grid.js';
import { Texture } from '../materials/Texture.js';
import NormalShader from '../shader/NormalShader.js';
import WorldShader from '../shader/WorldShader.js';
import LightShader from '../shader/LightingShader.js';

// performance option, use Array instad of Float32Arrays
glMatrix.setMatrixArrayType(Array);

Config.global.define('show.grid', false, false);
Config.global.define('debug', false, false);

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

	nextRenderBufferSlot() {
		const slot = this.currentRenderBufferSlot;
		this.currentRenderBufferSlot++;
		return slot;
	}

	onCreate() {

		this.debug = Config.global.getValue('debug');
		this.showGrid = Config.global.getValue('show.grid');

		this.grid = new Grid(100, 14);

		this.currentRenderBufferSlot = 0;

		this.lightDirection = [500.0, 250.0, 300.0];
		this.ambientLight = 0.25;
		this.background = [0.08, 0.08, 0.08, 1.0];
		this.shadowMapSize = 4096;

		this.renderPasses = [
			// new RenderPass(this, 'shadow', new LightShader(), null, this.shadowMapSize),
			// new RenderPass(this, 'world', new WorldShader()),
			new RenderPass(this, 'color'),
		];

		this.renderTarget = new Screen();
		this.compShader = new CompShader();
	}

	setScene(scene) {
		this.scene = scene;
	}

	updateViewport() {

		for (let pass of this.renderPasses) {
			pass.resize(this.width, this.height);
		}

		if (this.scene) {
			this.scene.activeCamera.sensor = {
				width: this.width,
				height: this.height
			};

			this.scene.lightSources.sensor = {
				width: this.width,
				height: this.height
			};
		}
	}

	setResolution(width, height) {
		super.setResolution(width, height);

		this.updateViewport();

		logger.log(`Resolution set to ${this.width}x${this.height}`);
	}

	createRenderPass(name, shader, setupCallback, resolution, onlyDepth) {
		const pass = new RenderPass(this, name, shader, setupCallback, resolution, onlyDepth);
		this.renderPasses.push(pass);
	}

	draw() {
		this.renderRenderPasses();
		this.compositeRenderPasses();
	}

	renderRenderPasses() {
		const gl = this.gl;

		for (let pass of this.renderPasses) {

			pass.use();

			gl.clearColor(0, 0, 0, 0);
			this.clear();

			if (pass.id == "shadow") {
				this.drawScene(this.scene, this.scene.lightSources, null, pass.shader != null);
			} else {
				this.drawScene(this.scene, this.scene.activeCamera, null, pass.shader != null);
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

				this.currentShader.setUniforms(this, {
					'position': [
						light.position.x,
						light.position.y,
						light.position.z,
					],
					'color': light.color,
					'intensity': light.intensity,
					'size': light.size,
				}, "lights[" + lightCount + "]");

				lightCount++;
			}
		}

		this.currentShader.setUniforms(this, {
			'shadowProjViewMat': this.scene.lightSources.projViewMatrix,
		});

		this.currentRenderBufferSlot = 0;

		// push pass frame buffers to comp
		for (let pass of this.renderPasses) {
			this.pushTexture(this.getBufferTexture(pass.id), pass.id + 'Buffer');
		}

		// push depth from color buffer
		this.pushTexture(this.getBufferTexture('color.depth'), 'depthBuffer');

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
		if (!gltexture) {
			this.prepareTexture(texture);
		}
		const type = texture ? this.gl[texture.type] : null;
		this.useTextureBuffer(gltexture, type, uniformStr, slot);
	}

	pushTexture(gltexture, uniformStr) {
		this.useTextureBuffer(gltexture, this.gl.TEXTURE_2D, uniformStr, this.nextRenderBufferSlot());
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

		if (!geo.buffer.vao) {
			geo.buffer.vao = this.createVAO();
		}

		this.useVAO(geo.buffer.vao);

		if (!this.scene || this.scene.lastchange != geo.buffer.lastchange) {
			if (this.scene) {
				geo.buffer.lastchange = this.scene.lastchange;
			}

			this.initializeBuffersAndAttributes(geo.buffer);
		}

		geo.modelMatrix = geo.modelMatrix || mat4.create();
		const modelMatrix = geo.modelMatrix;

		const position = Vec.add(geo.position, this.scene.origin);
		const rotation = Vec.add(geo.rotation, this.scene.rotation);
		const scale = geo.scale * this.scene.scale;

		mat4.identity(modelMatrix);

		mat4.translate(modelMatrix, modelMatrix, position);

		mat4.rotateX(modelMatrix, modelMatrix, rotation.x);
		mat4.rotateY(modelMatrix, modelMatrix, rotation.y);
		mat4.rotateZ(modelMatrix, modelMatrix, rotation.z);

		mat4.translate(modelMatrix, modelMatrix, geo.origin);

		mat4.scale(modelMatrix, modelMatrix, new Vec(scale, scale, scale));

		this.currentShader.setUniforms(this, { 'model': modelMatrix }, 'scene');
	}

	drawScene(scene, camera, filter, shaderOverwrite) {
		const objects = scene.getRenderableObjects();

		let tempShader;
		if (this.currentShader) {
			tempShader = this.currentShader;
		}

		// prepeare every used shader with global uniforms of the scene
		for (let [_, shader] of this.shaders) {
			this.useShader(shader);

			this.currentShader.setUniforms(this, {
				'projection': camera.projMatrix,
				'view': camera.viewMatrix
			}, 'scene');

			this.currentShader.setUniforms(this, {
				'time': performance.now(),
				'lightDirection': this.lightDirection,
				'ambientLight': this.ambientLight,
				'cameraPosition': camera.position
			});
		}

		if (tempShader) {
			this.useShader(tempShader);
		}

		if (this.showGrid) {
			objects.push(this.grid);
		}

		for (let obj of objects) {
			if (filter && filter(obj) || !filter) {
				this.drawMesh(obj, shaderOverwrite);
			}
		}
	}

	drawMesh(geo, shaderOverwrite) {
		if (geo.material) {

			if (!shaderOverwrite && this.currentShader !== geo.material.shader) {
				this.useShader(geo.material.shader);
			}

			this.applyMaterial(geo.material);

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

	constructor(renderer, id, shaderOverwrite, setupCallback, resolution, isDepthBuffer) {
		this.id = id;
		this.shader = shaderOverwrite;
		this.renderer = renderer;

		this.setupCallback = setupCallback;

		this.resolution = resolution || [];

		this.width = this.resolution[0] || renderer.width;
		this.height = this.resolution[1] || renderer.height;

		this.isDepthBuffer = isDepthBuffer;

		this.fbo = null;

		if (this.isDepthBuffer) {
			this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).depthbuffer();
		} else {
			this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).colorbuffer();
		}
	}

	resize(width, height) {
		if (!this.resolution[0]) {
			this.width = width;
			this.height = height;

			if (this.isDepthBuffer) {
				this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).depthbuffer();
			} else {
				this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).colorbuffer();
			}
		}
	}

	use() {
		this.renderer.useFramebuffer(this.id);
		this.renderer.viewport(this.width, this.height);

		if (this.shader) {
			this.renderer.useShader(this.shader);
		}

		if (this.setupCallback) {
			this.setupCallback();
		}
	}
}
