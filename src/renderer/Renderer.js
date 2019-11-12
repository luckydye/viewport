import { RendererContext } from './RendererContext.js';
import CompShader from '../shader/CompShader.js';
import { Logger } from '../Logger.js';
import Config from '../Config.js';
import { Geometry } from '../scene/Geometry.js';
import { Grid } from '../geo/Grid.js';
import { Texture } from '../materials/Texture.js';
import NormalShader from '../shader/NormalShader.js';
import PrimitiveShader from '../shader/PrimitiveShader.js';
import { RenderPass } from './RenderPass.js';
import IndexShader from '../shader/IndexShader.js';

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

		this.renderTarget = new Screen();
		this.grid = new Grid();

		this.compShader = new CompShader();

		this.debug = Config.global.getValue('debug');
		this.showGrid = Config.global.getValue('show.grid');
		this.showGuides = true;
		this.clearPass = true;

		this.shadowColor = [0, 0, 0, 0.33];
		this.background = [0, 0, 0, 0];
		this.shadowMapSize = 4096;

		this.vertexBuffers = new Map();
		this.materialShaders = new Map();
		this.textures = new Map();

		this.currentRenderBufferSlot = 0;
		this.currentScene = null;

		this.info = {};

		this.renderPasses = [];

		const self = this;

		this.createRenderPass('shadow', {
			get camera() {
				if(self.currentScene.lightsource) {
					return self.currentScene.lightsource;
				}
			},
			filter(geo) {
				return !geo.guide && geo.material && geo.material.castShadows;
			},
			colorBuffer: false,
			shaderOverwrite: new NormalShader(),
			resolution: [this.shadowMapSize, this.shadowMapSize],
			options: {
				CULL_FACE: false
			}
		})

		this.createRenderPass('color', {
			filter(geo) {
				return !geo.guide;
			}
		})
		
		this.createRenderPass('index', {
			filter(geo) {
				return !geo.guide && geo.selectable;
			},
			shaderOverwrite: new IndexShader(),
			options: {
				CULL_FACE: false
			}
		})

		this.createRenderPass('guides', {
			filter(geo) {
				return geo.guide && self.showGuides;
			},
			shaderOverwrite: new PrimitiveShader()
		})
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
		this.info.objects = this.vertexBuffers.size - 1;

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

				this.setOptions(pass.sceneSetup.options);

				this.clear();

				const camera = pass.sceneSetup.camera || setup.camera || scene.cameras[0];

				if(!camera.isLight) {
					camera.sensor.width = this.width;
					camera.sensor.height = this.height;
				}

				this.drawScene(scene, camera, pass.sceneSetup);

				this.setOptions(this.options);
			}
			
			this.clearFramebuffer();
			
			this.compositeRenderPasses();
		} else {

			const camera = setup.camera || scene.cameras[0];

			this.clear();
			this.drawScene(scene, camera, setup);
		}
	}

	preComposition() {
		// composition hook
	}

	compositeRenderPasses() {
		const gl = this.gl;

		if(this.clearPass) {
			gl.clearColor(...this.background);
			this.clear();
		} else {
			this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
		}

		this.useShader(this.compShader);

		this.currentRenderBufferSlot = 0;
		if(this.currentRenderBufferSlot == 0) {
			// push pass frame buffers to comp
			this.useTextureBuffer(this.getBufferTexture('color'), gl.TEXTURE_2D, 'color', this.nextRenderBufferSlot());
			this.useTextureBuffer(this.getBufferTexture('color.depth'), gl.TEXTURE_2D, 'depth', this.nextRenderBufferSlot());
			this.useTextureBuffer(this.getBufferTexture('guides'), gl.TEXTURE_2D, 'guides', this.nextRenderBufferSlot());
			this.useTextureBuffer(this.getBufferTexture('guides.depth'), gl.TEXTURE_2D, 'guidesDepth', this.nextRenderBufferSlot());
			this.useTextureBuffer(this.getBufferTexture('index'), gl.TEXTURE_2D, 'index', this.nextRenderBufferSlot());
		}

		this.preComposition(gl);

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
		if(!texture || texture && !texture.image) {
			this.emptyTexture = this.emptyTexture || Texture.EMPTY;
			texture = this.emptyTexture;
		}

		const type = texture ? this.gl[texture.type] : null;
		this.useTextureBuffer(this.prepareTexture(texture), type, uniformStr, slot);
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

		this.useTexture(material.texture, 'material.texture', 0);
		this.useTexture(material.specularMap, 'material.specularMap', 1);
		this.useTexture(material.normalMap, 'material.normalMap', 2);
		this.useTexture(material.displacementMap, 'material.displacementMap', 3);
		this.useTextureBuffer(this.getBufferTexture('shadow.depth'), this.gl.TEXTURE_2D, 'shadowDepth', 4);

		this.currentShader.setUniforms(material.attributes, `material`);

		if(Object.keys(material.customUniforms).length > 0) {
			this.currentShader.setUniforms(material.customUniforms);
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

		const geoState = geo.getState();
		if(geoState != geo.cache) {
			geo.updateModelMatrix();
		}
		geo.cache = geoState;

		if(this.currentScene) {
			this.currentShader.setUniforms({ 
				'model': geo.modelMatrix 
			}, 'scene');
			this.currentShader.setUniforms({ 
				'objectIndex': [...this.currentScene.objects].indexOf(geo) / 255,
			});
		}
	}

	drawScene(scene, camera, setup = {
		filter: null,
		shaderOverwrite: null,
	}) {
		
		this.currentScene = scene;

		const filter = setup.filter;
		const shaderOverwrite = setup.shaderOverwrite;

		if(!camera) return;

		camera.updateModelMatrix();

		const objects = scene.getRenderableObjects(camera);

		let tempShader;
		if (this.currentShader) {
			tempShader = this.currentShader;
		}

		// prepeare every used shader with global uniforms of the scene
		for (let [_, shader] of this.shaders) {
			this.useShader(shader);

			this.currentShader.setUniforms({
				'projectionView': camera.projViewMatrix,
			}, 'scene');
		}

		const materials = objects.map(obj => obj.materials).flat();
		this.materials = materials;

		if(!shaderOverwrite) {
			// update materials
			for(let mat of materials) {
				const shader = this.getMaterialShader(mat);
				this.useShader(shader);

				const lightSource = scene.lightsource;
	
				if(lightSource && camera !== lightSource) {
					this.currentShader.setUniforms({
						'shadowProjMat': lightSource.projMatrix,
						'shadowViewMat': lightSource.viewMatrix,
					});
				}

				this.currentShader.setUniforms({
					'cameraPosition': [
						camera.position.x + camera.origin.x,
						camera.position.y + camera.origin.y,
						camera.position.z + camera.origin.z
					],
				});
			}
		}

		if (tempShader) {
			this.useShader(tempShader);
		}

		if (this.showGrid) {
			objects.push(this.grid);
		}

		this.info.verts = 0;

		for(let [uid, buffer] of this.vertexBuffers) {
			if(![...objects, this.renderTarget].find(obj => obj.uid === uid)) {
				this.vertexBuffers.delete(uid);
			}
		}

		for (let obj of objects) {
			if (filter && filter(obj) || !filter) {
				this.drawMesh(obj, shaderOverwrite);
			}

			const geoBuffer = this.getGemoetryBuffer(obj);
			this.info.verts += geoBuffer.vertecies.length / geoBuffer.elements;
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

			const drawWithMaterial = (material, index) => {
				const shader = this.getMaterialShader(material);

				if (!shaderOverwrite && this.currentShader !== shader) {
					this.useShader(shader);
					this.applyMaterial(material);
				}

				this.currentShader.setUniforms({
					'materialIndex': index,
				});
				
				if (geo.instanced) {
					this.drawGeoInstanced(geo);
				} else {
					this.drawGeo(geo);
				}
			}

			let matIndex = 0;

			for(let mat of geo.materials) {
				matIndex++;
				drawWithMaterial(mat, matIndex);

				if(shaderOverwrite) break;
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
