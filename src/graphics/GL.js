import { mat4, vec3 } from 'gl-matrix';
import { Vec } from "../Math.js";
import { GLShader } from "./GLShader.js";

export class GLContext {

	get width() { return this.gl.canvas.width; }
	get height() { return this.gl.canvas.height; }

	get aspectratio() { return this.width / this.height; }

	onCreate() {
		// on create method
	}

	constructor(canvas) {
		if(!canvas) throw "GLContext: Err: no canvas";

		this.currentShader = null;

		this.vertexArrayObjects = new Map();
		this.framebuffers = new Map();
		this.bufferTextures = new Map();

		// default options set
		this.options = {
			DEPTH_TEST: true,
			CULL_FACE: true,
			BLEND: true,
		}

		this.getContext(canvas);

		this.onCreate();

		// enable gl options
		for(let opt in this.options) {
			if(this.options[opt] === true) {
				this.gl.enable(this.gl[opt]);
			}
		}
	}

	viewport(width, height) {
		this.gl.viewport(0, 0, width, height);
	}

	setResolution(width, height) {
		this.gl.canvas.width = width;
		this.gl.canvas.height = height;
		this.viewport(this.width, this.height);
	}

	clear() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	getContext(canvas) {
		this.canvas = canvas;

		const ctxtOpts = { 
			// alpha: false
		};
		this.gl = canvas.getContext("webgl2", ctxtOpts) || 
				  canvas.getContext("webgl", ctxtOpts);

		this.gl.cullFace(this.gl.BACK);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	}

	useShader(shader) {
		this.gl.useProgram(shader.program);
		shader.setUniforms(this.gl);
		this.currentShader = shader;
	}

	useTexture(texture, uniformStr, slot) {
		if(uniformStr && slot != null) {
			this.gl.activeTexture(this.gl["TEXTURE" + slot]);
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
			this.gl.uniform1i(this.currentShader.uniforms[uniformStr], slot);
		} else {
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		}
	}

	useFramebuffer(name) {
		if(this.framebuffers.has(name)) {
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.get(name));
		} else {
			console.error("Err:", name, "framebuffer not found");
		}
	}

	clearFramebuffer() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}

	getBufferTexture(name) {
		return this.bufferTextures.get(name);
	}

	prepareShader(shader) {
		const gl = this.gl;
		if(shader instanceof GLShader) {

			if(shader.src) {
				shader._vertShader = this.compileShader(shader.src[0], gl.VERTEX_SHADER);
				shader._fragShader = this.compileShader(shader.src[1], gl.FRAGMENT_SHADER);
				shader.program = this.createProgram(shader._vertShader, shader._fragShader);

				shader._uniforms = this.getUniforms(shader.program);
				shader._attributes = this.getAttributes(shader.program);
				
				shader.initialized = true;
			}

			return shader.program;
		}
	}

	getAttributes(program) {
		const gl = this.gl;
		const attributes = {};
	
		const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for (let i = 0; i < numAttributes; ++i) {
			const name = gl.getActiveAttrib(program, i).name;
			attributes[name] = gl.getAttribLocation(program, name);
		}
	
		return attributes;
	}

	getUniforms(program) {
		const gl = this.gl;
		const uniforms = {};
		const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < numUniforms; ++i) {
			const name = gl.getActiveUniform(program, i).name;
			uniforms[name] = gl.getUniformLocation(program, name);
		}
		return uniforms;
	}

	compileShader(src, type) {
		const gl = this.gl;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);

		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error(src);
			throw new Error(gl.getShaderInfoLog(shader));
		}

		return shader;
	}

	useVAO(name) {
		const VAO = this.vertexArrayObjects.get(name);
		if(VAO) {
			this.gl.bindVertexArray(VAO);
		} else {
			console.log("Err", "VAO not found");
		}
	}

	createVAO(name) {
		const VAO = this.gl.createVertexArray();
		this.vertexArrayObjects.set(name, VAO);
		this.gl.bindVertexArray(VAO);
	}

	createFramebuffer(name, width, height) {
		const gl = this.gl;

		const fbo = this.gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		return {
			colorbuffer: () => {
				const renderTraget = this.createBufferTexture(width, height);
				this.useTexture(renderTraget);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTraget, 0);

				const depthTexture = this.createDepthTexture(width, height);
				this.useTexture(depthTexture);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
				
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				this.useTexture(null);

				this.bufferTextures.set('depth', depthTexture);
				this.bufferTextures.set(name, renderTraget);
				this.framebuffers.set(name, fbo);
			},
			depthbuffer: () => {
				const depthTexture = this.createDepthTexture(width, height);
				this.useTexture(depthTexture);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
				
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				this.useTexture(null);

				this.bufferTextures.set(name, depthTexture);
				this.framebuffers.set(name, fbo);
			}
		}
	}

	createProgram(vertShader, fragShader) {
		const gl = this.gl;
		const program = gl.createProgram();
		gl.attachShader(program, vertShader);
		gl.attachShader(program, fragShader);
		gl.linkProgram(program);

		if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program));
		}
	
		return program;
	}

	createDepthTexture(w, h) {
		const gl = this.gl;

		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);

		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	createBufferTexture(w, h) {
		const gl = this.gl;

		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	updateTexture(texture, image) {
		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	createTexture(image, w, h) {
		const gl = this.gl;

		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);

		if(image) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		} else {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([ 0 ]));
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	setTransformUniforms(uniforms, geo) {
		const gl = this.gl;
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

		mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(
			scale, scale, scale
		));

		const modelView = mat4.create();
		mat4.multiply(modelView, this.scene.camera.viewMatrix, modelMatrix);

		const worldInverseMatrix = mat4.create();
		mat4.invert(worldInverseMatrix, modelView);

		const uNormalMatrix = mat4.create();
		mat4.transpose(uNormalMatrix, worldInverseMatrix);
		
		gl.uniformMatrix4fv(uniforms["uNormalMatrix"], false, uNormalMatrix);
		gl.uniformMatrix4fv(uniforms["uModelMatrix"], false, modelMatrix);
	}

	setBuffersAndAttributes(attributes, bufferInfo) {
		const gl = this.gl;
		const elements = bufferInfo.elements;
		const bpe = bufferInfo.vertecies.BYTES_PER_ELEMENT;
		let newbuffer = false;

		if(bufferInfo.vertecies.length < 1) {
			return;
		}

		if(!('buffer' in bufferInfo)) {
			bufferInfo.buffer = gl.createBuffer();
			newbuffer = true;
		}
		const buffer = bufferInfo.buffer;
	
		if (!buffer) throw new Error('Failed to create buffer.');
	
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		if(newbuffer) {
			gl.bufferData(gl.ARRAY_BUFFER, bufferInfo.vertecies, gl.STATIC_DRAW);
		}
	
		let lastAttrSize = 0;
	
		for(let i = 0; i < bufferInfo.attributes.length; i++) {

			gl.vertexAttribPointer(
				attributes[bufferInfo.attributes[i].attribute], 
				bufferInfo.attributes[i].size, 
				gl.FLOAT, 
				false, 
				elements * bpe, 
				lastAttrSize * bpe
			);
			gl.enableVertexAttribArray(attributes[bufferInfo.attributes[i].attribute]);
	
			lastAttrSize += bufferInfo.attributes[i].size;
		}
	}
	
}
