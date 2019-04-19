import { mat4, vec3 } from 'gl-matrix';
import { Vec } from "../Math.js";
import { GLShader } from "../shader/GLShader";

export class GLContext {

	// canvas sizes
	get width() { return this.gl.canvas.width; }
	get height() { return this.gl.canvas.height; }
	get aspectratio() { return this.width / this.height; }

	onCreate() {
		// on create method
	}

	enable(constant) {
		this.gl.enable(constant);
	}

	disable(constant) {
		this.gl.disable(constant);
	}

	constructor(canvas) {
		if(!canvas) throw "GLContext: Err: no canvas";

		this.currentShader = null;

		this.vertexArrayObjects = new Map();
		this.framebuffers = new Map();
		this.bufferTextures = new Map();
		this.shaders = new Map();

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

	// set viewport resolution
	viewport(width, height) {
		this.gl.viewport(0, 0, width, height);
	}

	// set canvas and viewport resolution
	setResolution(width, height) {
		this.gl.canvas.width = width;
		this.gl.canvas.height = height;
		this.viewport(this.width, this.height);
	}

	// clear framebuffer
	clear() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	// get webgl context from canvas
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

	// use webgl shader
	useShader(shader) {
		this.gl.useProgram(shader.program);
		shader.setUniforms(this.gl);
		this.currentShader = shader;
	}

	// use framebuffer
	useTexture(texture, uniformStr, slot) {
		if(uniformStr && slot != null) {
			this.gl.activeTexture(this.gl["TEXTURE" + slot]);
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
			this.gl.uniform1i(this.currentShader.uniforms[uniformStr], slot);
		} else {
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		}
	}

	// use framebuffer
	useFramebuffer(name) {
		if(this.framebuffers.has(name)) {
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.get(name));
		} else {
			console.error("Err:", name, "framebuffer not found");
		}
	}

	// unbind framebuffer
	clearFramebuffer() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}

	// get framebuffer texture from cache
	getBufferTexture(name) {
		return this.bufferTextures.get(name);
	}

	// initialize webgl shader
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

			this.shaders.set(shader.name, shader);
			return shader.program;
		}
	}

	// get attributes from shader program
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

	// get uniforms from shader program
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

	// compile glsl shader
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

	// use vertex attribute object
	useVAO(name) {
		const VAO = this.vertexArrayObjects.get(name);
		if(VAO) {
			this.gl.bindVertexArray(VAO);
		} else {
			console.log("Err", "VAO not found");
		}
	}

	// create vertex attribute object
	createVAO(name) {
		const VAO = this.gl.createVertexArray();
		this.vertexArrayObjects.set(name, VAO);
		this.gl.bindVertexArray(VAO);
	}

	// create webgl framebuffer objects
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

	// create shader program
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

	// create framebuffer depth texture
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

	// create framebuffer texture
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

	// update webgl texture
	updateTexture(texture, image) {
		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	// create webgl texture
	createTexture(image) {
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

	// translate / transform geometry
	setGeoTransformUniforms(uniforms, geo) {
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

		this.gl.uniformMatrix4fv(uniforms["uModelMatrix"], false, modelMatrix);
	}

	// prepare geometry buffers for draw
	setBuffersAndAttributes(attributes, bufferInfo) {
		const gl = this.gl;

		// exit if verts are meptyy
		if(bufferInfo.vertecies.length < 1) return;
		
		// create new buffers
		let newbuffer = false;
		if(!('buffer' in bufferInfo)) {
			newbuffer = true;

			bufferInfo.vertexBuffer = gl.createBuffer();
			bufferInfo.indexBuffer = gl.createBuffer();
		}
	
		// bind indexbuffer
		const indexBuffer = bufferInfo.indexBuffer;
		if (!indexBuffer) throw new Error('Failed to create indexbuffer.');

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		if(newbuffer) {
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indecies, gl.STATIC_DRAW);
		}

		// bind vertexbuffer
		const vertexBuffer = bufferInfo.vertexBuffer;
		if (!vertexBuffer) throw new Error('Failed to create vertexBuffer.');
	
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		if(newbuffer) {
			gl.bufferData(gl.ARRAY_BUFFER, bufferInfo.vertecies, gl.STATIC_DRAW);
		}

		const elements = bufferInfo.elements;
		const bpe = bufferInfo.vertecies.BYTES_PER_ELEMENT;

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

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indexBuffer);
	}
	
}
