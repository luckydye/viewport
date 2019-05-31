import { GLContext } from '../renderer/GL';
import FinalShader from '../shader/FinalShader';
import ColorShader from '../shader/ColorShader';
import PrimitiveShader from '../shader/PrimitiveShader';
import { Logger } from '../Logger';
import Config from '../Config';
import { mat4, vec3 } from 'gl-matrix';
import { Vec } from '../Math';
import MattShader from '../shader/MattShader';
import { Pointlight } from '../light/Pointlight';
import NormalShader from './../shader/NormalShader';
import { Geometry } from '../scene/Geometry';
import WorldShader from './../shader/WorldShader';
import UVShader from './../shader/UVShader';
import SpecularShader from './../shader/SpecularShader ';

const logger = new Logger('Renderer');

class Screen extends Geometry {
	static attributes = [
		{ size: 3, attribute: "aPosition" },
		{ size: 2, attribute: "aTexCoords" },
	]
	get vertecies() {
		return [
			-1, -1, 0, 	0, 0,
			1, -1, 0, 	1, 0, 
			1, 1, 0, 	1, 1,
			1, 1, 0, 	1, 1,
			-1, 1, 0, 	0, 1, 
			-1, -1, 0, 	0, 0,
		]
	}
}

export class Renderer extends GLContext {

	background = [0.08, 0.08, 0.08, 1.0];

	static defaults = {
		resolution: [
			window.innerWidth, 
			window.innerHeight
		]
	}

	get gridEnabled() {
		return Config.global.getValue('drawGrid', true);
	}

	get fogEnabled() {
		return Config.global.getValue('fogEnabled', true);
	}

	setScene(scene) {
		this.scene = scene;
	}

	updateViewport() {
		this.scene.activeCamera.sensor = {
			width: this.width,
			height: this.height
		};
	}

    onCreate() {
		this.renderTarget = new Screen();

		this.setResolution(...Renderer.defaults.resolution);

		this.shadowMapSize = 3096;

		const renderRes = this.width;

		this.renderPasses = [
			new RenderPass(this, 'shadow', new ColorShader(), this.aspectratio, this.shadowMapSize, true),

			new RenderPass(this, 'normal', new NormalShader(), this.aspectratio, renderRes),
			new RenderPass(this, 'uv', new UVShader(), this.aspectratio, renderRes),
			new RenderPass(this, 'spec', new SpecularShader(), this.aspectratio, renderRes),

			new RenderPass(this, 'world', new WorldShader(), this.aspectratio, renderRes),

			new RenderPass(this, 'color', new ColorShader(), this.aspectratio, renderRes),

			new RenderPass(this, 'guides', new PrimitiveShader(), this.aspectratio, renderRes),
			new RenderPass(this, 'id', new MattShader(), this.aspectratio, renderRes),
		]

		this.compShader = new FinalShader();

		this.readings = {};

		logger.log(`Resolution set to ${this.width}x${this.height}`);
	}

	draw() {
		if(!this.scene) return;

		const frameTime = performance.now();

		if(this.lastFrameTime) {
			
			// update textures
			for(let geo of this.scene.objects) {
				if(geo.material && geo.material.animated) {
					this.updateTextureBuffer(geo.material.texture.gltexture, geo.material.texture.image);
				}
			}

			this.renderMultiPasses(this.renderPasses);
			this.compositePasses(this.renderPasses);

			this.frameTime = frameTime - this.lastFrameTime;
		}
		this.lastFrameTime = frameTime;
	}

	renderMultiPasses(passes) {
		const gl = this.gl;
		const camera = this.scene.activeCamera;

		for(let pass of passes) {
			const cullDefault = gl.isEnabled(gl.CULL_FACE);

			pass.use();

			this.useShader(pass.shader);

			switch(pass.id) {

				case "shadow":
					this.drawScene(this.scene, this.scene.lightSources, obj => {
						return obj.material.castShadows;
					});
					break;

				case "guides":
					if(cullDefault) this.disable(gl.CULL_FACE);
					this.drawScene(this.scene, camera, obj => obj.guide);
					if(cullDefault) this.enable(gl.CULL_FACE);
					break;
				
				case "id":
					if(cullDefault) this.disable(gl.CULL_FACE);
					this.drawScene(this.scene, camera, obj => {
						if(obj.id != null) {
							gl.uniform1f(pass.shader.uniforms.geoid, obj.id);
							return true;
						}
						return false;
					});
					this.disable(gl.DEPTH_TEST);
					const curosr = this.scene.curosr;
					gl.uniform1f(pass.shader.uniforms.geoid, curosr.id);
					this.drawMesh(curosr);
					this.enable(gl.DEPTH_TEST);
					if(cullDefault) this.enable(gl.CULL_FACE);
					break;

				default:
					this.drawScene(this.scene, camera, obj => !obj.guide);
			}

			if(pass.id in this.readings) {
				const read = this.readings[pass.id];
				if(!read.value) {
					read.setValue(this.readPixels(read.x, read.y, 1, 1));
				}
			}
		}
		
		this.clearFramebuffer();
	}

	readPixelFromBuffer(x, y, buffer) {
		return new Promise((resolve, reject) => {
			this.readings[buffer] = {
				x, y, 
				value: null, 
				setValue(value) {
					this.value = value;
					resolve(value);
				}
			};
		})
	}

	readPixels(x = 0 , y = 0, w = 1, h = 1) {
		const gl = this.gl;
		const pixels = new Uint8Array(w * h * 4);
		gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		return pixels;
	}

	compositePasses(passes) {
		const gl = this.gl;

		gl.clearColor(...this.background);
		this.clear();

		this.viewport(this.width, this.height);

		this.useShader(this.compShader);

		for(let i = 0; i < passes.length; i++) {
			const pass = passes[i];
			this.useTextureBuffer(pass.buffer, gl.TEXTURE_2D, pass.id + "Buffer", i);
		}

		this.useTextureBuffer(this.getBufferTexture('color.depth'), gl.TEXTURE_2D, 'depthBuffer', passes.length+1);

		gl.uniformMatrix4fv(this.compShader.uniforms.lightProjViewMatrix, false, this.scene.lightSources.projViewMatrix);
		gl.uniform1i(this.compShader.uniforms.fog, this.fogEnabled);

		let lightCount = 0;
		for(let light of this.scene.objects) {
			if(light instanceof Pointlight) {

				this.gl.uniform3fv(this.compShader.uniforms["lights["+lightCount+"].position"], [
					light.position.x,
					light.position.y,
					light.position.z,
				]);
				
				this.gl.uniform3fv(this.compShader.uniforms["lights["+lightCount+"].color"], light.color);
				this.gl.uniform1f(this.compShader.uniforms["lights["+lightCount+"].intensity"], light.intensity);
				this.gl.uniform1f(this.compShader.uniforms["lights["+lightCount+"].size"], light.size);
				lightCount++;
			}
		}

		this.gl.uniform1i(this.compShader.uniforms.lightCount, lightCount);

		this.setupScene(this.compShader, this.scene.activeCamera);

		this.drawGeo(this.renderTarget);

		gl.clearColor(0, 0, 0, 0);
	}

	// give texture a .gltexture
	prepareTexture(texture) {
		if(!texture.gltexture) {
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
	applyMaterial(shader, material) {
		shader.setUniforms(this, material, 'material');
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

	setupScene(shader, camera) {
		this.gl.uniformMatrix4fv(shader.uniforms["scene.projection"], false, camera.projMatrix);
		this.gl.uniformMatrix4fv(shader.uniforms["scene.view"], false, camera.viewMatrix);
		
		this.gl.uniform3fv(shader.uniforms.cameraPosition, [
			camera.worldPosition.x,
			camera.worldPosition.y,
			camera.worldPosition.z,
		]);
	}

	drawScene(scene, camera, filter) {
		const objects = scene.getRenderableObjects();
		const shader = this.currentShader;

		this.setupScene(shader, camera);
		
		for(let obj of objects) {
			if(filter && filter(obj) || !filter) {
				this.drawMesh(obj);
			}
		}
	}

	drawMesh(geo) {
		if(geo.material) {
			this.applyMaterial(this.currentShader, geo.material);

			if(geo.instanced) {
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

		if(buffer.indecies.length > 0) {
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
		for(let f = 0; f < 6; f++) {
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

		for(let face of faces) {
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

	constructor(renderer, id, shader, ar, resolution, isDepthBuffer) {
		this.id = id;
		this.shader = shader;
		this.renderer = renderer;
        
		this.width = resolution;
		this.height = resolution / ar;

		this.fbo = null;

		if(isDepthBuffer) {
            this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).depthbuffer();
        } else {
            this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height).colorbuffer();
        }
	}

	use() {
		this.renderer.useFramebuffer(this.id);
		this.renderer.clear();
		this.renderer.viewport(this.width, this.height);
	}
}
