import Config from '../Config.js';
import { Grid } from '../geo/Grid.js';
import { Texture } from '../materials/Texture.js';
import { Camera } from '../scene/Camera.js';
import { Geometry } from '../scene/Geometry.js';
import CompShader from '../shader/CompShader.js';
import IndexShader from '../shader/IndexShader.js';
import NormalShader from '../shader/NormalShader.js';
import LightShader from '../shader/LightShader.js';
import PrimitiveShader from '../shader/PrimitiveShader.js';
import { RendererContext } from './RendererContext.js';
import { RenderPass } from './RenderPass.js';
import SSAOShader from '../shader/SSAOShader.js';
import VRShader from '../shader/VRShader.js';

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

	FRAME_LEFT: 6,
	FRAME_RIGHT: 7,

	FRAME_COLOR: 1,
	FRAME_COLOR_DEPTH: 2,
	FRAME_GUIDES: 3,
	FRAME_GUIDES_DEPTH: 4,
	FRAME_NORMAL: 5,
	FRAME_WORLD: 6,
	FRAME_INDEX: 7,
	FRAME_LIGHTING: 14,

	SHADOW_MAP: 8,

	MESH_TEXTURE: 9,
	MESH_SPECULAR_MAP: 10,
	MESH_DISPLACEMENT_MAP: 11,
	MESH_NORMAL_MAP: 12,

	PLACEHOLDER: 13,
}

export class Renderer extends RendererContext {

	static get TEXTURE() {
		return TEXTURE;
	}

	static get defaults() {
		return {
			resolution: [
				1280,
				720
			]
		}
	}

	get showGrid() {
		return this.renderConfig.getValue('show.grid');
	}

	get debugLevel() {
		return this.renderConfig.getValue('debuglevel');
	}

	get drawWireframe() {
		return this.renderConfig.getValue('wireframe');
	}

	get shadowMapSize() {
		return this.renderConfig.getValue('shadowMapSize');
	}

	setConfig(config) {
		this.renderConfig = config;
		this.renderConfig.define('show.grid', false, false);
		this.renderConfig.define('debug', false, false);
		this.renderConfig.define('debuglevel', 0, 0);
		this.renderConfig.define('shadowMapSize', 4096, 4096);
		this.renderConfig.define('wireframe', false, false);
		this.renderConfig.define('showGuides', false);
		this.renderConfig.define('clearPass', false);
		this.renderConfig.define('indexPass', false);
		this.renderConfig.define('shadowPass', false);
		this.renderConfig.load();
	}

	onCreate() {
		this.setConfig(Config.global);

		Renderer.showGuides = Renderer.showGuides || Config.global.getValue('showGuides');
		Renderer.clearPass = Renderer.clearPass || Config.global.getValue('clearPass');
		Renderer.indexPass = Renderer.indexPass || Config.global.getValue('indexPass');
		Renderer.shadowPass = Renderer.shadowPass || Config.global.getValue('shadowPass');

		this.debug = this.renderConfig.getValue('debug');

		this.screen = new Screen();
		this.grid = new Grid();
		
		this.compShader = new VRShader();

		this.textures = {};
		this.vertexBuffers = new Map();
		this.materialShaders = new Map();

		this.emptyTexture = this.prepareTexture(new Texture());
		this.placeholderTexture = this.prepareTexture(new Texture(Texture.PLACEHOLDER));
		this.placeholderTexture = this.emptyTexture;

		this.renderTargets = [];

		this.MAX_TEXTURE_UINTS = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);

		this.clearPass = Renderer.clearPass;
		this.shadowColor = [0, 0, 0, 0.33];
		this.background = [0, 0, 0, 0];

		this.fogMax = 0.25;
		this.fogDensity = 1000;
		this.fogStartOffset = 0.0001;

		this.lastSceneId = null;
		this.currentScene = null;
		this.currentCamera = null;
		this.objectIndex = null;

		this.info = {};

		this.initialRender = true;

		this.bloomShader = new LightShader();
		this.postprocessingPass = new RenderPass(this, 'lighting');
	}

	setResolution(width, height) {
		super.setResolution(width, height);

		const timeoutTime = 14 * 5;

		if(Date.now() - this.resizeTimeout < timeoutTime) {
			
			if(this.timout) {
				clearTimeout(this.timout);
			}

			this.timout = setTimeout(() => {
				this.setResolution(width, height);
			}, timeoutTime);

			return;
		}
		
		this.resizeTimeout = Date.now();
		this.initialRender = true;

		if(this.debug) {
			console.log(`Resolution set to ${this.width}x${this.height}`);
		}
	}

	clearBuffers() {
		this.vertexBuffers = new Map();
		this.materialShaders = new Map();
		this.textures = {};
	}

	draw(scene, setup = {}) {
		
		if(this.debug) {
			this.info.resolution = `${this.width}x${this.height}`;
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

		for(let camera of scene.cameras) {
			if(camera && camera.perspective == Camera.PERSPECTIVE) {
				camera.sensor.width = this.width;
				camera.sensor.height = this.height;
			}
			if(camera && camera.perspective == Camera.ORTHGRAPHIC) {
				camera.sensor.width = camera.sensor.width;
				camera.sensor.height = camera.sensor.width / (this.width / this.height);
			}
		}
		
		this.gl.clearColor(...this.background);

		this.clear();
		
		this.viewport(this.width, this.height);

		this.drawScene(scene, setup);

		if(this.renderTargets[0]) {
			this.renderTargets[0].finalize();
		}
		if(this.renderTargets[1]) {
			this.renderTargets[1].finalize();
		}

		this.clearFramebuffer();

		this.useShader(this.compShader);

		if(this.initialRender) {
			this.setTexture(this.emptyTexture, this.gl.TEXTURE_2D, TEXTURE.EMPTY);
			this.setTexture(this.placeholderTexture, this.gl.TEXTURE_2D, TEXTURE.PLACEHOLDER);
			this.initialRender = false;
		}

		this.setTexture(this.getBufferTexture('view0'), this.gl.TEXTURE_2D, TEXTURE.FRAME_LEFT, 'view0');
		this.setTexture(this.getBufferTexture('view1'), this.gl.TEXTURE_2D, TEXTURE.FRAME_RIGHT, 'view1');

		this.drawScreen();
	}

	prepareTexture(texture) {
		if(!texture.uid) {
			throw new Error('Texture not valid');
		}

		if(!this.textures[texture.uid]) {
			let newTexture = null;

			if(texture.format) {
				newTexture = this.createCompressedTexture(texture);
			} else {
				newTexture = this.createTexture(texture.image, {
					TEXTURE_WRAP_S: texture.wrap_s,
					TEXTURE_WRAP_T: texture.wrap_t,
					TEXTURE_MAG_FILTER: texture.mag_filter,
					TEXTURE_MIN_FILTER: texture.min_filter,
				});
			}

			this.textures[texture.uid] = newTexture;
		}
		return this.textures[texture.uid];
	}

	// give material attributes to shader
	applyMaterial(material) {
		if(material.texture) {
			this.setTexture(this.prepareTexture(material.texture), this.gl.TEXTURE_2D, TEXTURE.MESH_TEXTURE);
			this.currentShader.setUniforms({
				'textureFlipY': material.texture.flipY,
			});
		} else {
			this.setTexture(null, this.gl.TEXTURE_2D, TEXTURE.MESH_TEXTURE);
		}
		if(material.specularMap) {
			this.setTexture(this.prepareTexture(material.specularMap), this.gl.TEXTURE_2D, TEXTURE.MESH_SPECULAR_MAP);
		} else {
			this.setTexture(null, this.gl.TEXTURE_2D, TEXTURE.MESH_SPECULAR_MAP);
		}
		if(material.normalMap) {
			this.setTexture(this.prepareTexture(material.normalMap), this.gl.TEXTURE_2D, TEXTURE.MESH_NORMAL_MAP);
		} else {
			this.setTexture(null, this.gl.TEXTURE_2D, TEXTURE.MESH_NORMAL_MAP);
		}
		if(material.displacementMap) {
			this.setTexture(this.prepareTexture(material.displacementMap), this.gl.TEXTURE_2D, TEXTURE.MESH_DISPLACEMENT_MAP);
		} else {
			this.setTexture(null, this.gl.TEXTURE_2D, TEXTURE.MESH_DISPLACEMENT_MAP);
		}

		const shaderCache = this.currentShader.cache;

		if(shaderCache.material[material.uid] != material.lastUpdate) {
			shaderCache.material[material.uid] = material.lastUpdate;

			this.pushTexture(material.texture ? TEXTURE.MESH_TEXTURE : TEXTURE.PLACEHOLDER, 'material.texture');
			this.pushTexture(material.specularMap ? TEXTURE.MESH_SPECULAR_MAP : TEXTURE.EMPTY, 'material.specularMap');
			this.pushTexture(material.normalMap ? TEXTURE.MESH_NORMAL_MAP : TEXTURE.EMPTY, 'material.normalMap');
			this.pushTexture(material.displacementMap ? TEXTURE.MESH_DISPLACEMENT_MAP : TEXTURE.EMPTY, 'material.displacementMap');
			
			this.pushTexture(TEXTURE.SHADOW_MAP, 'shadowDepth');

			this.currentShader.setUniforms({
				'lightColor': this.currentScene.lightsource.color,
			});
			this.currentShader.setUniforms(material.attributes, 'material');

			if(material.customUniforms) {
				this.currentShader.setUniforms(material.customUniforms);
			}
		}
	}

	getGemoetryBuffer(geo) {
		if(!this.vertexBuffers.has(geo.uid)) {
			this.vertexBuffers.set(geo.uid, geo.createBuffer());
		}
		return this.vertexBuffers.get(geo.uid);
	}

	drawScene(scene, {
		filter = null,
		shaderOverwrite = null,
	} = {}) {

		const cameras = scene.cameras;

		if(cameras.length == 0) return;

		for(let camera of cameras) {
			const views = camera.view;
			
			if(Array.isArray(views)) {
				for(let cam of views) {
					cam.updateModel();
				}
			} else {
				views.updateModel();
			}
		}

		const objects = scene.getRenderableObjects(cameras[0]);
		const materials = objects.map(obj => obj.materials).flat();
		this.materials = materials;

		if (this.showGrid) {
			objects.push(this.grid);
		}

		this.info.verts = 0;

		for(let [uid, buffer] of this.vertexBuffers) {
			if(![...objects, this.screen].find(obj => obj.uid === uid)) {
				this.vertexBuffers.delete(uid);
			}
		}

		for (let obj of objects) {
			if (filter && filter(obj) || !filter) {
				this.objectIndex = [...this.currentScene.objects].indexOf(obj);
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

			const cameras = this.currentScene.cameras;

			const drawForAllViews = () => {
				let camIndex = 0;

				for(let camera of cameras) {

					let renderTarget = this.renderTargets[camIndex];

					if(!renderTarget) {
						renderTarget = new RenderPass(this, 'view' + camIndex);
						this.renderTargets[camIndex] = renderTarget;
					}

					renderTarget.use();

					this.currentShader.setUniforms({
						'viewPosition': [
							-camera.position.x,
							-camera.position.y,
							-camera.position.z,
						]
					});

					this.currentShader.setUniforms({
						'projectionView': camera.projViewMatrix,
					}, 'scene');

					const drawmode = geo.material ? geo.material.drawmode || this.currentShader.drawmode 
												: this.currentShader.drawmode;

					this.drawGeo(geo, drawmode);

					camIndex++;
				}
			}

			let matIndex = 0;
				
			for(let material of geo.materials) {
				const shader = this.getMaterialShader(material);
				this.useShader(shader);
				this.setupGemoetry(geo);
				
				this.gl.uniform1i(this.currentShader._uniforms.currentMaterialIndex, matIndex);
				
				this.applyMaterial(material);
				
				const custom = this.currentShader.customUniforms;
				if(custom) {
					this.currentShader.setUniforms(custom);
				}

				drawForAllViews();

				matIndex++;
			}
			
		} else {
			this.getGemoetryBuffer(geo);
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
				geo.updateModel();
			}

			if(!shaderObjectCache[geo.uid]) {
				shaderObjectCache.size = shaderObjectCache.size+1 || 1;
			}

			if (shaderObjectCache.size > 1 || shaderObjectCache[geo.uid] != geo.lastUpdate) {
				shaderObjectCache[geo.uid] = geo.lastUpdate;

				this.currentShader.setUniforms({ 'model': geo.modelMatrix }, 'scene');
			}
		}
	}

	drawGeo(geo, drawmode) {
		if (geo.instanced) {
			this.drawGeoInstanced(geo, drawmode);
			return;
		}

		const gl = this.gl;
		const buffer = this.getGemoetryBuffer(geo);

		if (buffer.indecies.length > 0) {
			gl.drawElements(gl[drawmode], buffer.indecies.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawArrays(gl[drawmode], 0, buffer.vertecies.length / buffer.elements);
		}
	}

	drawGeoInstanced(geo, drawmode) {
		const gl = this.gl;
		const bufferInfo = this.getGemoetryBuffer(geo);
		const vertCount = bufferInfo.vertecies.length / bufferInfo.elements;

		if(!bufferInfo.instanceBuffer) {
			this.initializeInstanceBuffer(bufferInfo);
		} else {
			this.updateArrayBuffer(bufferInfo.instanceBuffer, bufferInfo.getInstanceBuffer());
		}

		gl.drawArraysInstanced(gl[drawmode], 0, vertCount, geo.instances);
	}

	drawScreen() {
		this.currentScene = null;
		this.setupGemoetry(this.screen);
		this.drawGeo(this.screen, this.currentShader.drawmode);
	}

}
