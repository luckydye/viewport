import Config from '../Config.js';
import { Grid } from '../geo/Grid.js';
import { Texture } from '../materials/Texture.js';
import { Camera } from '../scene/Camera.js';
import { Geometry } from '../scene/Geometry.js';
import CompShader from '../shader/CompShader.js';
import IndexShader from '../shader/IndexShader.js';
import NormalShader from '../shader/NormalShader.js';
import PrimitiveShader from '../shader/PrimitiveShader.js';
import { RendererContext } from './RendererContext.js';
import { RenderPass } from './RenderPass.js';

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
	FRAME_INDEX: 7,
	SHADOW_MAP: 8,
	MESH_TEXTURE: 9,
	MESH_SPECULAR_MAP: 10,
	MESH_DISPLACEMENT_MAP: 11,
	MESH_NORMAL_MAP: 12,
	PLACEHOLDER: 13,
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
		return this.renderConfig.getValue('show.grid');
	}

	get debugLevel() {
		return this.renderConfig.getValue('debuglevel');
	}

	get drawWireframe() {
		return this.renderConfig.getValue('wireframe');
	}

	setConfig(config) {
		this.renderConfig = config;
		this.renderConfig.define('show.grid', false, false);
		this.renderConfig.define('debug', false, false);
		this.renderConfig.define('debuglevel', 0, 0);
		this.renderConfig.define('wireframe', false, false);
		this.renderConfig.load();
	}

	onCreate() {
		this.setConfig(Config.global);

		this.debug = this.renderConfig.getValue('debug');

		this.renderTarget = new Screen();
		this.grid = new Grid();

		this.compShader = new CompShader();

		this.textures = {};
		this.vertexBuffers = new Map();
		this.materialShaders = new Map();

		this.emptyTexture = this.prepareTexture(new Texture());
		this.placeholderTexture = this.prepareTexture(new Texture(Texture.PLACEHOLDER));

		this.MAX_TEXTURE_UINTS = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);

		this.showGuides = true;
		this.clearPass = true;
		this.indexPass = true;
		this.shadowColor = [0, 0, 0, 0.33];
		this.background = [0, 0, 0, 0];
		this.shadowMapSize = 4096;

		this.lastSceneId = null;
		this.currentScene = null;
		this.currentCamera = null;
		this.objectIndex = null;

		this.info = {};

		this.renderPasses = [];

		this.initialRender = true;

		const self = this;

		if(this.shadowMapSize > 0) {
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
		}

		this.createRenderPass('color', {
			filter(geo) { return !geo.guide; }
		});
		
		if(this.indexPass) {
			const indexShader = new IndexShader();
			const renderer = this;
			indexShader.customUniforms = {
				get objectIndex() {
					return renderer.objectIndex;
				}
			};

			this.createRenderPass('index', {
				filter(geo) {
					return !geo.guide && geo.selectable || geo.selectable;
				},
				antialiasing: false,
				shaderOverwrite: indexShader,
				options: {
					CULL_FACE: false
				}
			})
		}

		if(this.showGuides) {
			this.createRenderPass('guides', {
				filter(geo) {
					return (geo.guide || self.drawWireframe) && self.showGuides;
				},
				antialiasing: true,
				shaderOverwrite: new PrimitiveShader()
			})
		}
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

		for (let pass of this.renderPasses) {
			pass.resize(this.width, this.height);
		}

		if(this.debug) {
			console.log(`Resolution set to ${this.width}x${this.height}`);
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
			this.info.resolution = `${this.width}x${this.height}`;
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

		if(this.currentCamera && this.currentCamera.perspective == Camera.PERSPECTIVE) {
			this.currentCamera.sensor.width = this.width;
			this.currentCamera.sensor.height = this.height;
		}

		if(this.currentCamera && this.currentCamera.perspective == Camera.ORTHGRAPHIC) {
			this.currentCamera.sensor.width = this.currentCamera.sensor.width;
			this.currentCamera.sensor.height = this.currentCamera.sensor.width / (this.width / this.height);
		}
		
		if(this.renderPasses.length > 0) {
			for (let pass of this.renderPasses) {
				pass.use();

				this.setOptions(pass.sceneSetup.options);
				this.clear();

				const camera = pass.sceneSetup.camera || setup.camera || scene.cameras[0];

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
	}

	compositeRenderPasses() {
		const gl = this.gl;

		this.useShader(this.compShader);

		if(this.initialRender) {
			this.setTexture(this.emptyTexture, this.gl.TEXTURE_2D, TEXTURE.EMPTY);
			this.setTexture(this.placeholderTexture, this.gl.TEXTURE_2D, TEXTURE.PLACEHOLDER);

			this.setTexture(this.getBufferTexture('color'), this.gl.TEXTURE_2D, TEXTURE.FRAME_COLOR, 'color');
			this.setTexture(this.getBufferTexture('color.depth'), this.gl.TEXTURE_2D, TEXTURE.FRAME_COLOR_DEPTH, 'depth');
			this.setTexture(this.getBufferTexture('guides'), this.gl.TEXTURE_2D, TEXTURE.FRAME_GUIDES, 'guides');
			this.setTexture(this.getBufferTexture('guides.depth'), this.gl.TEXTURE_2D, TEXTURE.FRAME_GUIDES_DEPTH, 'guidesDepth');
			this.setTexture(this.getBufferTexture('normal'), this.gl.TEXTURE_2D, TEXTURE.FRAME_NORMAL, 'normal');
			this.setTexture(this.getBufferTexture('world'), this.gl.TEXTURE_2D, TEXTURE.FRAME_WORLD, 'world');
			this.setTexture(this.getBufferTexture('shadow.depth'), this.gl.TEXTURE_2D, TEXTURE.SHADOW_MAP, 'shadow');
			this.setTexture(this.getBufferTexture('index'), this.gl.TEXTURE_2D, TEXTURE.FRAME_INDEX, 'index');

			this.initialRender = false;
		}

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

		const shaderCache = this.currentShader.cache;

		if(shaderCache.material[material.uid] != material.lastUpdate) {
			shaderCache.material[material.uid] = material.lastUpdate;

			this.pushTexture(material.texture ? TEXTURE.MESH_TEXTURE : TEXTURE.PLACEHOLDER, 'material.texture');
			this.pushTexture(material.specularMap ? TEXTURE.MESH_SPECULAR_MAP : TEXTURE.EMPTY, 'material.specularMap');
			this.pushTexture(material.normalMap ? TEXTURE.MESH_NORMAL_MAP : TEXTURE.EMPTY, 'material.normalMap');
			this.pushTexture(material.displacementMap ? TEXTURE.MESH_DISPLACEMENT_MAP : TEXTURE.EMPTY, 'material.displacementMap');
			
			this.pushTexture(TEXTURE.SHADOW_MAP, 'shadowDepth');

			this.currentShader.setUniforms(material.attributes, 'material');
		}

		const lightSource = this.currentScene.lightsource;
		this.currentShader.setUniforms({
			'shadowProjMat': lightSource.projMatrix,
			'shadowViewMat': lightSource.viewMatrix,
		});

		this.currentShader.setUniforms({
			'viewPosition': [
				-this.currentCamera.position.x,
				-this.currentCamera.position.y,
				-this.currentCamera.position.z,
			]
		});
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

		camera.updateModel();

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

			let matIndex = 0;

			if (!shaderOverwrite) {
				const shader = this.getMaterialShader(geo.material);
				this.useShader(shader);
				this.setupGemoetry(geo);

				this.currentShader.setUniforms({
					'projectionView': this.currentCamera.projViewMatrix,
				}, 'scene');

				for(let material of geo.materials) {
					this.gl.uniform1i(this.currentShader._uniforms.currentMaterialIndex, matIndex);

					this.applyMaterial(material);
					this.drawGeo(geo, material.drawmode || this.currentShader.drawmode);

					matIndex++;
				}
			} else {
				this.useShader(shaderOverwrite);

				this.currentShader.setUniforms({
					'projectionView': this.currentCamera.projViewMatrix,
				}, 'scene');

				if(this.currentShader.customUniforms) {
					this.currentShader.setUniforms(this.currentShader.customUniforms);
				}

				const drawmode = geo.material ? geo.material.drawmode || this.currentShader.drawmode : this.currentShader.drawmode;

				if(geo.material) {
					this.currentShader.setUniforms(geo.material.attributes, 'material');
				}

				this.setupGemoetry(geo);
				this.drawGeo(geo, drawmode);
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

			if (Object.keys(shaderObjectCache).length > 1 ||
				shaderObjectCache[geo.uid] != geo.lastUpdate) {
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
		this.setupGemoetry(this.renderTarget);
		this.drawGeo(this.renderTarget, this.currentShader.drawmode);
	}

}
