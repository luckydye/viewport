import Config from '../Config.js';
import { Grid } from '../geo/Grid.js';
import { Logger } from '../Logger.js';
import { Texture } from '../materials/Texture.js';
import { Geometry } from '../scene/Geometry.js';
import MeshShader from '../shader/MeshShader.js';
import NormalShader from '../shader/NormalShader.js';
import PrimitiveShader from '../shader/PrimitiveShader.js';
import SSAOShader from '../shader/SSAOShader.js';
import { RendererContext } from './RendererContext.js';
import { RenderPass } from './RenderPass.js';
import WorldShader from '../shader/WorldShader.js';
import CompShader from '../shader/CompShader.js';

Config.global.define('show.grid', false, false);
Config.global.define('debug', false, false);
Config.global.define('debuglevel', 0, 0);
Config.global.define('wireframe', false, false);

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

const TEXTURE = {
	EMPTY: 0,
	FRAME_COLOR: 1,
	FRAME_COLOR_DEPTH: 2,
	FRAME_GUIDES: 3,
	FRAME_GUIDES_DEPTH: 4,
	FRAME_NORMAL: 5,
	FRAME_WORLD: 6,
	SHADOW_MAP: 7,
	MESH_TEXTURE: 8,
	MESH_SPECULAR_MAP: 9,
	MESH_DISPLACEMENT_MAP: 10,
	MESH_NORMAL_MAP: 11,
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

	get showGrid() {
		return Config.global.getValue('show.grid');
	}

	get debugLevel() {
		return Config.global.getValue('debuglevel');
	}

	get drawWireframe() {
		return Config.global.getValue('wireframe');
	}

	onCreate() {
		this.debug = Config.global.getValue('debug');

		this.renderTarget = new Screen();
		this.grid = new Grid();

		this.meshShader = new MeshShader();
		this.compShader = new CompShader();

		this.textures = {};
		this.vertexBuffers = new Map();
		this.materialShaders = new Map();

		this.compositionPass = this.createFramebuffer('comp', this.width, this.height);

		this.emptyTexture = this.prepareTexture(new Texture());

		this.MAX_TEXTURE_UINTS = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);

		this.showGuides = true;
		this.clearPass = true;

		this.shadowColor = [0, 0, 0, 0.33];
		this.background = [0, 0, 0, 0];
		this.shadowMapSize = 3072;

		this.lastSceneId = null;

		this.currentScene = null;
		this.currentCamera = null;

		this.info = {};

		this.renderPasses = [];

		this.initialRender = true;

		const self = this;

		this.createRenderPass('shadow', {
			get camera() {
				return self.currentScene.lightsource;
			},
			filter(geo) {
				return !geo.guide && geo.material && geo.material.castShadows;
			},
			colorBuffer: false,
			antialiasing: false,
			shaderOverwrite: new NormalShader(),
			resolution: [this.shadowMapSize, this.shadowMapSize],
			options: {
				CULL_FACE: false
			}
		})

		this.createRenderPass('color', {
			filter(geo) { return !geo.guide; }
		});

		this.createRenderPass('normal', {
			filter(geo) { return !geo.guide; },
			shaderOverwrite: new NormalShader(),
		});

		this.createRenderPass('world', {
			filter(geo) { return !geo.guide; },
			shaderOverwrite: new WorldShader(),
		});
		
		// TODO: Draw index buffer when needed
		// this.createRenderPass('index', {
		// 	filter(geo) {
		// 		return !geo.guide && geo.selectable;
		// 	},
		// 	shaderOverwrite: new IndexShader(),
		// 	options: {
		// 		CULL_FACE: false
		// 	}
		// })

		this.createRenderPass('guides', {
			filter(geo) {
				return (geo.guide || self.drawWireframe) && self.showGuides;
			},
			antialiasing: false,
			shaderOverwrite: new PrimitiveShader()
		})
	}

	setResolution(width, height) {
		super.setResolution(width, height);

		this.initialRender = true;

		for (let pass of this.renderPasses) {
			pass.resize(this.width, this.height);
		}

		if(this.debug) {
			logger.log(`Resolution set to ${this.width}x${this.height}`);
		}
	}

	createRenderPass(name, setup = {}) {
		const pass = new RenderPass(this, name, setup);
		this.renderPasses.push(pass);
		return pass;
	}

	clearBuffers() {
		this.vertexBuffers = new Map();
		this.materialShaders = new Map();
		this.textures = {};
	}

	draw(scene, setup = {}) {
		if(this.debug) {
			this.info.passes = this.renderPasses.length;
			this.info.debug = this.debug;
			this.info.shaders = this.shaders.size;
			this.info.materials = this.materials ? this.materials.length : 0;
			this.info.textures = Object.keys(this.textures).length;
			this.info.objects = this.vertexBuffers.size - 1;
		}

		this.currentScene = scene;

		if(this.lastSceneId !== scene.uid) {
			this.lastSceneId = scene.uid;
			this.clearBuffers();
		}
		
		if(this.renderPasses.length > 0) {
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

				pass.finalize();
			}
			
			this.clearFramebuffer();
			
			this.compositeRenderPasses();

		} else {
			this.clear();
			this.drawScene(scene, setup.camera || scene.cameras[0], setup);
		}

		this.initialRender = false;
	}

	compositeRenderPasses() {
		const gl = this.gl;

		this.useShader(this.compShader);

		if(this.initialRender) {
			this.setTexture(this.emptyTexture, this.gl.TEXTURE_2D, TEXTURE.EMPTY);

			this.setTexture(this.getBufferTexture('color'), this.gl.TEXTURE_2D, TEXTURE.FRAME_COLOR, 'color');
			this.setTexture(this.getBufferTexture('color.depth'), this.gl.TEXTURE_2D, TEXTURE.FRAME_COLOR_DEPTH, 'depth');
			this.setTexture(this.getBufferTexture('guides'), this.gl.TEXTURE_2D, TEXTURE.FRAME_GUIDES, 'guides');
			this.setTexture(this.getBufferTexture('guides.depth'), this.gl.TEXTURE_2D, TEXTURE.FRAME_GUIDES_DEPTH, 'guidesDepth');
			this.setTexture(this.getBufferTexture('normal'), this.gl.TEXTURE_2D, TEXTURE.FRAME_NORMAL, 'normal');
			this.setTexture(this.getBufferTexture('world'), this.gl.TEXTURE_2D, TEXTURE.FRAME_WORLD, 'world');
			this.setTexture(this.getBufferTexture('shadow.depth'), this.gl.TEXTURE_2D, TEXTURE.SHADOW_MAP, 'shadow');
		}
		
		const lightSource = this.currentScene.lightsource;

		this.currentShader.setUniforms({
			'shadowProjMat': lightSource.projMatrix,
			'shadowViewMat': lightSource.viewMatrix,
		});

		if(this.clearPass) {
			gl.clearColor(...this.background);
			this.clear();
		}

		this.clearFramebuffer();
		this.drawScreen();
	}

	prepareTexture(texture) {
		if(!this.textures[texture.uid]) {
			let newTexture = null;

			if(texture.format) {
				newTexture = this.createCompressedTexture(texture);
			} else {
				newTexture = this.createTexture(texture.image);
			}

			this.textures[texture.uid] = newTexture;
		}
		return this.textures[texture.uid];
	}

	// give material attributes to shader
	applyMaterial(material) {
		// update textures
		if (material && material.animated) {
			if (material.texture && material.texture.image) {
				this.updateTextureBuffer(this.prepareTexture(material.texture), material.texture.image);
			}
			if (material.specularMap && material.specularMap.image) {
				this.updateTextureBuffer(this.prepareTexture(material.specularMap), material.specularMap.image);
			}
			if (material.normalMap && material.normalMap.image) {
				this.updateTextureBuffer(this.prepareTexture(material.normalMap), material.normalMap.image);
			}
			if (material.displacementMap && material.displacementMap.image) {
				this.updateTextureBuffer(this.prepareTexture(material.displacementMap), material.displacementMap.image);
			}
		}

		const shaderCache = this.currentShader.cache;

		if(shaderCache.material != material.lastUpdate) {
			shaderCache.material = material.lastUpdate;

			this.pushTexture(material.texture ? TEXTURE.MESH_TEXTURE : TEXTURE.EMPTY, 'material.texture');
			this.pushTexture(material.specularMap ? TEXTURE.MESH_SPECULAR_MAP : TEXTURE.EMPTY, 'material.specularMap');
			this.pushTexture(material.normalMap ? TEXTURE.MESH_NORMAL_MAP : TEXTURE.EMPTY, 'material.normalMap');
			this.pushTexture(material.displacementMap ? TEXTURE.MESH_DISPLACEMENT_MAP : TEXTURE.EMPTY, 'material.displacementMap');

			this.currentShader.setUniforms(material.attributes, 'material');
		}

		if(material.texture) {
			this.setTexture(this.prepareTexture(material.texture), this.gl.TEXTURE_2D, TEXTURE.MESH_TEXTURE);
		}
		if(material.specularMap) {
			this.setTexture(this.prepareTexture(material.specularMap), this.gl.TEXTURE_2D, TEXTURE.MESH_SPECULAR_MAP);
		}
		if(material.normalMap) {
			this.setTexture(this.prepareTexture(material.normalMap), this.gl.TEXTURE_2D, TEXTURE.MESH_NORMAL_MAP);
		}
		if(material.displacementMap) {
			this.setTexture(this.prepareTexture(material.displacementMap), this.gl.TEXTURE_2D, TEXTURE.MESH_DISPLACEMENT_MAP);
		}
	}

	getGemoetryBuffer(geo) {
		if(!this.vertexBuffers.has(geo.uid)) {
			this.vertexBuffers.set(geo.uid, geo.createBuffer());
		}
		return this.vertexBuffers.get(geo.uid);
	}

	drawScene(scene, camera, {
		filter = null,
		shaderOverwrite = null,
	} = {}) {
		this.currentCamera = camera;

		if(!camera) return;

		camera.updateModelMatrix();

		const objects = scene.getRenderableObjects(camera);
		const materials = objects.map(obj => obj.materials).flat();
		this.materials = materials;

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

			if(this.debug) {
				const geoBuffer = this.getGemoetryBuffer(obj);
				this.info.verts += geoBuffer.vertecies.length / geoBuffer.elements;
			}
		}
	}

	getMaterialShader(material) {
		if(!this.materialShaders.has(material.uid)) {
			this.materialShaders.set(material.uid, new material.shader());
		}
		return this.materialShaders.get(material.uid);
	}

	drawMesh(geo, shaderOverwrite) {
		if (geo.material || shaderOverwrite) {

			let matIndex = 0;

			if (!shaderOverwrite) {
				const shader = this.meshShader;
				this.useShader(shader);
				this.setupGemoetry(geo);

				this.currentShader.setUniforms({
					'projectionView': this.currentCamera.projViewMatrix,
				}, 'scene');

				for(let material of geo.materials) {
					this.gl.uniform1i(this.currentShader._uniforms.currentMaterialIndex, matIndex);

					this.applyMaterial(material);
					this.drawGeo(geo);

					matIndex++;
				}
			} else {
				this.useShader(shaderOverwrite);

				this.currentShader.setUniforms({
					'projectionView': this.currentCamera.projViewMatrix,
				}, 'scene');

				this.setupGemoetry(geo);
				this.drawGeo(geo);
			}
			
		}
	}

	setupGemoetry(geo) {
		const buffer = this.getGemoetryBuffer(geo);

		if (!buffer.vao) {
			buffer.vao = this.createVAO(buffer);
		}

		this.useVAO(buffer.vao);

		if(this.currentScene) {

			const shaderObjectCache = this.currentShader.cache.objects;

			if (geo.matrixAutoUpdate || shaderObjectCache[geo.uid] != geo.lastUpdate) {
				geo.updateModelMatrix();
			}

			if (Object.keys(shaderObjectCache).length > 1 ||
				shaderObjectCache[geo.uid] != geo.lastUpdate) {

				this.currentShader.setUniforms({ 
					'model': geo.modelMatrix 
				}, 'scene');
			}
		}
	}

	drawGeo(geo) {
		if (geo.instanced) {
			this.drawGeoInstanced(geo);
			return;
		}

		const gl = this.gl;
		const buffer = this.getGemoetryBuffer(geo);

		if (buffer.indecies.length > 0) {
			gl.drawElements(gl[this.currentShader.drawmode], buffer.indecies.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawArrays(gl[this.currentShader.drawmode], 0, buffer.vertecies.length / buffer.elements);
		}
	}

	drawGeoInstanced(geo) {
		const gl = this.gl;
		const buffer = this.getGemoetryBuffer(geo);
		const vertCount = buffer.vertecies.length / buffer.elements;

		gl.drawArraysInstanced(gl[this.currentShader.drawmode], 0, vertCount, geo.instances);
	}

	drawScreen() {
		this.currentScene = null;
		this.setupGemoetry(this.renderTarget);
		this.drawGeo(this.renderTarget);
	}

}
