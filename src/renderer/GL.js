import { GLShader } from "./GLShader";

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
		this.framebuffers = new Map();
		this.bufferTextures = new Map();
		this.shaders = new Map();
	
		this.options = {
			DEPTH_TEST: true,
			CULL_FACE: true,
			BLEND: true,
		}

		this.getContext(canvas);
		this.onCreate();

		// enable gl options
		this.setOptions(this.options);
	}

	setOptions(options) {
		for(let opt in options) {
			if(options[opt] === true) {
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
			alpha: false,
			desynchronized: true,
			preserveDrawingBuffer: true
		};
		this.gl = canvas.getContext("webgl2", ctxtOpts) || 
				  canvas.getContext("webgl", ctxtOpts);

		this.gl.cullFace(this.gl.BACK);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	}

	// use webgl shader
	useShader(shader) {
		if(!shader.initialized) {
			this.prepareShader(shader);
		}
		this.gl.useProgram(shader.program);
		shader.setUniforms(this, shader.uniform);
		this.currentShader = shader;
	}

	// use webgl texture
	useTextureBuffer(gltexture, type, uniformStr, slot) {
		if(uniformStr) {
			this.gl.activeTexture(this.gl["TEXTURE" + slot]);
			this.gl.bindTexture(type, gltexture);
			this.gl.uniform1i(this.currentShader.uniforms[uniformStr], slot);
		} else {
			this.gl.bindTexture(type, gltexture);
		}
	}

	// use framebuffer
	useFramebuffer(nameOrFBO) {
		if(this.framebuffers.has(nameOrFBO)) {
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers.get(nameOrFBO));
		} else {
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, nameOrFBO);
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

			if(shader.source) {
				shader._vertShader = this.compileShader(shader.source[0], gl.VERTEX_SHADER);
				shader._fragShader = this.compileShader(shader.source[1], gl.FRAGMENT_SHADER);
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

	// use vertex array object
	useVAO(VAO) {
		this.gl.bindVertexArray(VAO);
	}

	// create vertex array object
	createVAO() {
		const VAO = this.gl.createVertexArray();
		this.gl.bindVertexArray(VAO);
		return VAO;
	}

	// create webgl framebuffer objects
	createFramebuffer(name, width, height) {
		const gl = this.gl;

		const fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		this.framebuffers.set(name, fbo);

		let textures = {
			color: null,
			depth: null,
		}

		return {
			get colorTexture() {
				return textures.color;
			},
			get depthTexture() {
				return textures.depth;
			},

			colorbuffer: () => {
				const renderTraget = this.createBufferTexture(width, height);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTraget, 0);

				const depthTexture = this.createDepthTexture(width, height);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

				textures.color = renderTraget;
				textures.depth = depthTexture;

				if(name) {
					this.bufferTextures.set(name + '.depth', textures.depth);
					this.bufferTextures.set(name, textures.color);
				}
				
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);

				return fbo;
			},

			depthbuffer: () => {
				const depthTexture = this.createDepthTexture(width, height);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);

				textures.depth = depthTexture;

				if(name) {
					this.bufferTextures.set(name, textures.depth);
				}

				return fbo;
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

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	// update webgl texture
	updateTextureBuffer(texture, image) {
		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	// create webgl texture
	createTexture(image, noMipmap) {
		const gl = this.gl;

		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		if(image) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		} else {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([ 0 ]));
		}

		if(!noMipmap) {
			gl.generateMipmap(gl.TEXTURE_2D);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	// prepare geometry buffers for draw
	initializeBuffersAndAttributes(bufferInfo) {
		const gl = this.gl;
		const attributes = this.currentShader.attributes;

		// exit if verts are meptyy
		if(bufferInfo.vertecies.length < 1) return;

		const newbuffer = !bufferInfo.indexBuffer || !bufferInfo.vertexBuffer;
		
		// create new buffers
		if(newbuffer) {
			// bufferInfo.vao = this.createVAO();

			bufferInfo.indexBuffer = gl.createBuffer();
			bufferInfo.vertexBuffer = gl.createBuffer();

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indecies, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, bufferInfo.vertecies, gl.STATIC_DRAW);
			
		} else {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indexBuffer);
			gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.vertexBuffer);
		}
		
		const bpe = bufferInfo.vertecies.BYTES_PER_ELEMENT;

		let lastAttrSize = 0;

		const bufferAttributes = bufferInfo.attributes;

		for(let i = 0; i < bufferInfo.attributes.length; i++) {
			gl.vertexAttribPointer(
				attributes[bufferAttributes[i].attribute], 
				bufferAttributes[i].size,
				gl.FLOAT, 
				false, 
				bufferInfo.elements * bpe, 
				lastAttrSize * bpe
			);
			gl.enableVertexAttribArray(attributes[bufferAttributes[i].attribute]);
	
			lastAttrSize += bufferAttributes[i].size;
		}
	}
	
}
