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
		this.scene.activeCamera.update();
	}

    onCreate() {

		this.renderTarget = new Plane({ material: null });

		this.setResolution(...Renderer.defaults.resolution);

		this.shadowMapSize = 4096;

		this.renderPasses = [
			new RenderPass(this, 'shadow', new ColorShader(), this.aspectratio, this.shadowMapSize, true),
			new RenderPass(this, 'light', new LightShader(), this.aspectratio, this.width),
			new RenderPass(this, 'diffuse', new ColorShader(), this.aspectratio, this.width),
			new RenderPass(this, 'guides', new PrimitiveShader(), this.aspectratio, this.width),
			new RenderPass(this, 'id', new MattShader(), this.aspectratio, this.width),
		]

		this.compShader = new FinalShader();
		this.prepareShader(this.compShader);

		this.readings = {};

		logger.log(`Resolution set to ${this.width}x${this.height}`);
	}

	draw() {
		if(!this.scene) return;

		const frameTime = performance.now();

		// update animated textures
		for(let geo of this.scene.objects) {
			if(geo.material && geo.material.animated) {
				this.updateTexture(geo.material.texture.gltexture, geo.material.texture.image);
			}
		}

		this.renderMultiPasses(this.renderPasses);
		this.compositePasses(this.renderPasses);

		if(this.lastFrameTime) {
			this.frameTime = frameTime - this.lastFrameTime;
		}
		this.lastFrameTime = frameTime;
	}

	renderMultiPasses(passes) {
		const gl = this.gl;
		const camera = this.scene.activeCamera;

		for(let pass of passes) {
			const lightS = this.scene.lightSources;
			const cullDefault = gl.isEnabled(gl.CULL_FACE);

			pass.use();

			switch(pass.id) {

				case "shadow":
					this.drawScene(this.scene, lightS, obj => {
						return obj.material && obj.material.castShadows;
					});
					break;

				case "light":
					this.useTexture(this.getBufferTexture('shadow'), "shadowDepthMap", 0);
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
			this.useTexture(pass.buffer, pass.id + "Buffer", i);
		}
		this.useTexture(this.getBufferTexture('diffuse.depth'), 'depthBuffer', passes.length+1);

		this.gl.uniform1i(this.compShader.uniforms.fog, this.fogEnabled);

		this.drawGeo(this.renderTarget);

		this.gl.clearColor(0, 0, 0, 0);
	}

	// give texture a .gltexture
	prepareTexture(texture) {
		if(!texture.gltexture) {
			texture.gltexture = this.createTexture(texture.image || null);
		}
	}

	// give material attributes to shader
	applyMaterial(shader, material) {
		const colorTexture = material.texture;
		const reflectionMap = material.reflectionMap;
		const displacementMap = material.displacementMap;

		this.useTexture(null, "colorTexture", 1);
		this.useTexture(null, "reflectionMap", 2);
		this.useTexture(null, "displacementMap", 3);

		this.prepareTexture(colorTexture);
		this.useTexture(colorTexture.gltexture, "colorTexture", 1);

		this.prepareTexture(reflectionMap);
		this.useTexture(reflectionMap.gltexture, "reflectionMap", 2);

		this.prepareTexture(displacementMap);
		this.useTexture(displacementMap.gltexture, "displacementMap", 3);

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
	}

	drawScene(scene, camera, filter) {
		const objects = scene.objects;
		const shader = this.currentShader;

		this.setupScene(shader, camera);

		let lightCount = 0;
		for(let light of objects) {
			if(light.isLight) {
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

			if(geo.instanced && !geo.hidden) {
				this.drawGeoInstanced(geo);
			} else {
				this.drawGeo(geo);
			}
		}
	}

	drawGeoInstanced(geo) {
		if(geo.hidden) return;

		const gl = this.gl;
		const buffer = geo.buffer;
		const vertCount = buffer.vertecies.length / buffer.elements;
		
		this.setupGemoetry(geo);

		gl.drawArraysInstanced(gl[buffer.type], 0, vertCount, geo.instances);
	}

	drawGeo(geo) {
		if(geo.hidden) return;

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

		if(!shader.initialized) {
			this.renderer.prepareShader(shader);
        }
        
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
		this.renderer.useShader(this.shader);
	}
}
