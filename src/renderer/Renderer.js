import { RendererContext } from './RendererContext.js';
import CompShader from '../shader/CompShader.js';
import { Logger } from '../Logger.js';
import Config from '../Config.js';
import { mat4, glMatrix } from 'gl-matrix';
import { Vec } from '../Math.js';
import { Geometry } from '../scene/Geometry.js';
import { Grid } from '../geo/Grid.js';
import { Texture } from '../materials/Texture.js';
import NormalShader from '../shader/NormalShader.js';
import LightingShader from '../shader/LightingShader.js';
import { Camera } from '../scene/Camera.js';
import WorldShader from '../shader/WorldShader.js';
import PrimitiveShader from '../shader/PrimitiveShader.js';

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

		this.ambientLight = 0.5;
		this.shadowColor = [0, 0, 0, 0.33];
		this.background = [0.08, 0.08, 0.08, 1.0];
		this.shadowMapSize = 4096;

		this.vertexBuffers = new Map();
		this.materialShaders = new Map();
		this.textures = new Map();

		this.info = {};

		const self = this;

		this.currentScene = null;

		this.renderPasses = [
			new RenderPass(this, 'shadow', {
				get camera() {
					if(self.currentScene.lightsource) {
						self.currentScene.lightsource.sensor.width = 4096;
						self.currentScene.lightsource.sensor.height = 4096;
						return self.currentScene.lightsource;
					}
				},
				filter(geo) {
					return !geo.guide;
				},
				shaderOverwrite: new NormalShader(),
				resolution: [this.shadowMapSize, this.shadowMapSize]
			}),
			new RenderPass(this, 'color', {
				filter(geo) {
					return !geo.guide;
				}
			}),
			new RenderPass(this, 'guides', {
				filter(geo) {
					return geo.guide;
				},
				shaderOverwrite: new PrimitiveShader()
			}),
			new RenderPass(this, 'id', {
				filter(geo) {
					return !geo.guide;
				},
				shaderOverwrite: new WorldShader(),
			}),
		];

		this.renderTarget = new Screen();
		this.compShader = new CompShader();
	}

	updateViewport() {
		for (let pass of this.renderPasses) {
			pass.resize(this.width, this.height);
		}
	}

	setResolution(width, height) {
		super.setResolution(width, height);

		this.updateViewport();

		logger.log(`Resolution set to ${this.width}x${this.height}`);
	}

	createRenderPass(name, setup = {}) {
		const pass = new RenderPass(this, name, setup);
		this.renderPasses.push(pass);
		return pass;
	}

	clearBuffers() {
		this.vertexBuffers = new Map();
		this.materialShaders = new Map();
		this.textures = new Map();
	}

	draw(scene, setup = {}) {
		this.info.passes = this.renderPasses.length;
		this.info.debug = this.debug;
		this.info.shaders = this.shaders.size;
		this.info.materials = this.materialShaders.size;
		this.info.textures = this.textures.size;
		this.info.objects = this.vertexBuffers.size;

		if(this.currentScene !== scene) {
			this.clearBuffers();
		}

		if(!scene) {
			logger.error('No scene');
		}
		
		if(this.renderPasses.length > 0) {

			this.currentScene = scene;

			for (let pass of this.renderPasses) {
				pass.use();

				this.gl.clearColor(0, 0, 0, 0);
				this.clear();

				const camera = pass.sceneSetup.camera || setup.camera || scene.cameras[0];

				this.drawScene(scene, camera, pass.sceneSetup);
				
				this.clearFramebuffer();
			}

			this.compositeRenderPasses();
		} else {

			const camera = setup.camera || scene.cameras[0];

			this.gl.clearColor(0, 0, 0, 0);
			this.clear();
			this.drawScene(scene, camera, setup);
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

		this.currentRenderBufferSlot = 0;

		// push pass frame buffers to comp
		for (let pass of this.renderPasses) {
			this.pushTexture(this.getBufferTexture(pass.id), pass.id);
		}

		// push depth from color buffer
		this.pushTexture(this.getBufferTexture('color.depth'), 'depth');
		this.pushTexture(this.getBufferTexture('guides.depth'), 'guidesDepth');
		this.pushTexture(this.getBufferTexture('shadow'), 'shadow');

		this.preComposition();

		this.drawGeo(this.renderTarget);
	}

	prepareTexture(texture) {
		if(!this.textures.has(texture.uid)) {
			this.textures.set(texture.uid, this.createTexture(texture.image));
		}
		return this.textures.get(texture.uid);
	}

	// use a Texture
	useTexture(texture, uniformStr, slot) {
		let gltexture = this.prepareTexture(texture);

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
				const gltexture = this.prepareTexture(material.texture);
				this.updateTextureBuffer(gltexture, material.texture.image);
			}
			if (material.specularMap && material.specularMap.image) {
				const gltexture = this.prepareTexture(material.specularMap);
				this.updateTextureBuffer(gltexture, material.specularMap.image);
			}
			if (material.normalMap && material.normalMap.image) {
				const gltexture = this.prepareTexture(material.normalMap);
				this.updateTextureBuffer(gltexture, material.normalMap.image);
			}
			if (material.displacementMap && material.displacementMap.image) {
				const gltexture = this.prepareTexture(material.displacementMap);
				this.updateTextureBuffer(gltexture, material.displacementMap.image);
			}
		}

		this.currentShader.setUniforms(this, material.attributes, 'material');

		if(Object.keys(material.customUniforms).length > 0) {
			this.currentShader.setUniforms(this, material.customUniforms);
		}
	}

	getGemoetryBuffer(geo) {
		if(!this.vertexBuffers.has(geo.uid)) {
			this.vertexBuffers.set(geo.uid, geo.createBuffer());
		}
		return this.vertexBuffers.get(geo.uid);
	}

	setupGemoetry(geo) {

		const buffer = this.getGemoetryBuffer(geo);

		if (!buffer.vao) {
			buffer.vao = this.createVAO();
		}

		this.useVAO(buffer.vao);

		if (!this.currentScene || this.currentScene.lastchange != buffer.lastchange) {
			if (this.currentScene) {
				buffer.lastchange = this.currentScene.lastchange;
			}
			this.initializeBuffersAndAttributes(buffer);
		}

		geo.modelMatrix = geo.modelMatrix || mat4.create();
		const modelMatrix = geo.modelMatrix;

		const position = geo.position;
		const rotation = geo.rotation;
		const scale = geo.scale;

		mat4.identity(modelMatrix);

		mat4.translate(modelMatrix, modelMatrix, position);

		mat4.rotateX(modelMatrix, modelMatrix, rotation.x);
		mat4.rotateY(modelMatrix, modelMatrix, rotation.y);
		mat4.rotateZ(modelMatrix, modelMatrix, rotation.z);

		mat4.translate(modelMatrix, modelMatrix, geo.origin);

		mat4.scale(modelMatrix, modelMatrix, new Vec(scale, scale, scale));

		this.currentShader.setUniforms(this, { 'model': modelMatrix }, 'scene');
	}

	drawScene(scene, camera, setup = {
		filter: null,
		shaderOverwrite: null,
	}) {
		
		this.currentScene = scene;

		const filter = setup.filter;
		const shaderOverwrite = setup.shaderOverwrite;

		if(!camera) return;

		camera.sensor.width = this.width;
		camera.sensor.height = this.height;

		const objects = scene.getRenderableObjects(camera);

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

			const lightSource = scene.lightsource;

			if(lightSource) {
				this.currentShader.setUniforms(this, {
					'shadowProjMat': lightSource.projMatrix,
					'shadowViewMat': lightSource.viewMatrix,
					'lightDirection': [
						lightSource.worldPosition[0],
						lightSource.worldPosition[1],
						lightSource.worldPosition[2],
					],
				});
			}

			this.currentShader.setUniforms(this, {
				'ambientLight': this.ambientLight,
				'shadowColor': this.shadowColor,
				'cameraPosition': [
					camera.position.x + camera.origin.x,
					camera.position.y + camera.origin.y,
					camera.position.z + camera.origin.z
				],
			});

			this.useTextureBuffer(this.getBufferTexture('shadow.depth'), this.gl.TEXTURE_2D, 'shadowDepth', 5);
		}

		if (tempShader) {
			this.useShader(tempShader);
		}

		if (this.showGrid) {
			objects.push(this.grid);
		}

		this.info.verts = 0;

		for (let obj of objects) {
			if (filter && filter(obj) || !filter) {
				this.drawMesh(obj, shaderOverwrite);
			}

			this.info.verts += this.getGemoetryBuffer(obj).vertecies.length;
		}
	}

	getMaterialShader(material) {
		if(!this.materialShaders.has(material.uid)) {
			this.materialShaders.set(material.uid, new material.shader());
		}
		return this.materialShaders.get(material.uid);
	}

	drawMesh(geo, shaderOverwrite) {
		if (geo.material) {

			const shader = this.getMaterialShader(geo.material);

			if (!shaderOverwrite && this.currentShader !== shader) {
				this.useShader(shader);
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
		const buffer = this.getGemoetryBuffer(geo);
		const vertCount = buffer.vertecies.length / buffer.elements;

		this.setupGemoetry(geo);

		gl.drawArraysInstanced(gl[this.currentShader.drawmode], 0, vertCount, geo.instances);
	}

	drawGeo(geo) {
		const gl = this.gl;
		const buffer = this.getGemoetryBuffer(geo);

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

	constructor(renderer, id, setup = {
		resolution: null,
	}) {
		this.id = id;
		this.sceneSetup = setup;
		this.shader = setup.shaderOverwrite;
		this.renderer = renderer;

		this.resolution = setup.resolution || [];

		this.width = this.resolution[0] || renderer.width;
		this.height = this.resolution[1] || renderer.height;

		this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height);
	}

	resize(width, height) {
		if (!this.resolution[0]) {
			this.width = width;
			this.height = height;

			this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height);
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
