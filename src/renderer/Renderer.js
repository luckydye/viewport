import { Plane } from '../geo/Plane';
import { GLContext } from '../renderer/GL';
import FinalShader from '../shader/FinalShader';
import ColorShader from '../shader/ColorShader';
import LightShader from '../shader/LightShader';
import PrimitiveShader from '../shader/PrimitiveShader';
import { Logger } from '../Logger';
import Config from '../Config';
import { mat4 } from 'gl-matrix';
import { Vec } from '../Math';
import MattShader from '../shader/MattShader';
import { Pointlight } from '../light/Pointlight';

const logger = new Logger('Renderer');

export class Renderer extends GLContext {

	static defaults = {
		resolution: [
			window.innerWidth, 
			window.innerHeight
		]
	}

	background = [0.08, 0.08, 0.08, 1.0];

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
		this.renderTarget = new Plane({ material: null });

		this.setResolution(...Renderer.defaults.resolution);

		this.shadowMapSize = 4096;

		const renderRes = this.width;

		this.renderPasses = [
			new RenderPass(this, 'shadow', new ColorShader(), this.aspectratio, this.shadowMapSize, true),
			new RenderPass(this, 'light', new LightShader(), this.aspectratio, renderRes),
			new RenderPass(this, 'diffuse', new ColorShader(), this.aspectratio, renderRes),
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
			
			const lightS = this.scene.lightSources;

			pass.use();

			this.useShader(pass.shader);

			switch(pass.id) {

				case "shadow":
					if(lightS) {
						this.drawScene(this.scene, lightS, obj => {
							return obj.material.castShadows;
						});
					}
					break;

				case "light":
					this.useTextureBuffer(this.getBufferTexture('shadow'), this.gl.TEXTURE_2D, "shadowDepthMap", 0);
					gl.uniformMatrix4fv(pass.shader.uniforms.lightProjViewMatrix, false, lightS.projViewMatrix);
					this.drawScene(this.scene, camera, obj => {
						return obj.material.receiveShadows;
					});
					break;

				case "diffuse":
					this.drawScene(this.scene, camera, obj => !obj.guide);
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
							this.gl.uniform1f(pass.shader.uniforms.geoid, obj.id);
							return true;
						}
						return false;
					});
					this.disable(gl.DEPTH_TEST);
					const curosr = this.scene.curosr;
					this.gl.uniform1f(pass.shader.uniforms.geoid, curosr.id);
					this.drawMesh(curosr);
					this.enable(gl.DEPTH_TEST);
					if(cullDefault) this.enable(gl.CULL_FACE);
					break;
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
		this.gl.clearColor(...this.background);
		this.clear();

		this.viewport(this.width, this.height);

		this.useShader(this.compShader);
			
		for(let i in passes) {
			const pass = passes[i];
			this.useTextureBuffer(pass.buffer, this.gl.TEXTURE_2D, pass.id + "Buffer", i);
		}
		this.useTextureBuffer(this.getBufferTexture('diffuse.depth'), this.gl.TEXTURE_2D, 'depthBuffer', passes.length+1);

		this.gl.uniform1i(this.compShader.uniforms.fog, this.fogEnabled);

		this.drawGeo(this.renderTarget);

		this.gl.clearColor(0, 0, 0, 0);
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
		const colorTexture = material.texture;
		const specularMap = material.specularMap;
		const displacementMap = material.displacementMap;
		const normalMap = material.normalMap;

		this.prepareTexture(colorTexture);
		this.prepareTexture(specularMap);
		this.prepareTexture(displacementMap);
		this.prepareTexture(normalMap);
		
		this.useTexture(colorTexture, "colorTexture", 1);
		this.useTexture(specularMap, "specularMap", 2);
		this.useTexture(displacementMap, "displacementMap", 3);
		this.useTexture(normalMap, "normalMap", 4);

		shader.setUniforms(this.gl, material, 'material');
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
		
		const shader = this.currentShader;
		this.gl.uniformMatrix4fv(shader.uniforms["scene.model"], false, modelMatrix);
	}

	setupScene(shader, camera) {
		this.gl.uniformMatrix4fv(shader.uniforms["scene.projection"], false, camera.projMatrix);
		this.gl.uniformMatrix4fv(shader.uniforms["scene.view"], false, camera.viewMatrix);
		
		this.gl.uniform3fv(shader.uniforms.cameraPosition, [
			camera.worldPosition.x,
			camera.worldPosition.y,
			camera.worldPosition.z,
		]);

		if(this.scene.cubemap) {
			this.useTexture(this.scene.cubemap, 'cubemap', 5);
		}
	}

	drawScene(scene, camera, filter) {
		const objects = scene.getRenderableObjects();
		const shader = this.currentShader;

		this.setupScene(shader, camera);

		let lightCount = 0;
		for(let light of objects) {
			if(light instanceof Pointlight) {
				this.gl.uniform3fv(shader.uniforms["pointLights["+lightCount+"].position"], [
					light.position.x,
					light.position.y,
					light.position.z,
				]);
				
				this.gl.uniform3fv(shader.uniforms["pointLights["+lightCount+"].color"], light.color);
				this.gl.uniform1f(shader.uniforms["pointLights["+lightCount+"].intensity"], light.intensity);
				this.gl.uniform1f(shader.uniforms["pointLights["+lightCount+"].size"], light.size);
				lightCount++;
			}
		}

		this.gl.uniform1i(shader.uniforms.lightCount, lightCount);
		
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

}

export class RenderPass {

	get buffer() {
		return this.renderer.getBufferTexture(this.id);
	}

	get depthbuffer() {
		return this.renderer.getBufferTexture(this.id + 'Depth');
	}

	constructor(renderer, id, shader, ar, resolution, isDepthBuffer) {
		this.id = id;
		this.shader = shader;
		this.renderer = renderer;
        
		this.width = resolution;
		this.height = resolution / ar;

		if(isDepthBuffer) {
            this.renderer.createFramebuffer(this.id, this.width, this.height).depthbuffer();
        } else {
            this.renderer.createFramebuffer(this.id, this.width, this.height).colorbuffer();
        }
	}

	use() {
		this.renderer.useFramebuffer(this.id);
		this.renderer.clear();
		this.renderer.viewport(this.width, this.height);
	}
}
