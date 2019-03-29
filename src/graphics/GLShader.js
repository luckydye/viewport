export class GLShader {

	get vertexShader() {
		return this._vertShader;
	}

	get fragementShader() {
		return this._fragShader;
	}

	get uniforms() {
		return this._uniforms;
	}

	get attributes() {
		return this._attributes;
	}

	get uniform() {
		return {};
	}

	get src() {
		return this.constructor.source;
	}

	constructor({ name } = {}) {
		this.name = name;
		
		this.program = null;
		this.initialized = false;
	}

    setUniforms(gl) {
		const uniforms = this.uniforms;
		if(uniforms) {
			for(let opt in this.uniform) {
				const value = this.uniform[opt];
				if(opt === "integer") {
					for(let opt in this.uniform.integer) {
						gl.uniform1i(uniforms[opt], this.uniform.integer[opt]);
					}
				}
				if(Array.isArray(value)) {
					gl.uniform3fv(uniforms[opt], value);
				} else {
					gl.uniform1f(uniforms[opt], value);
				}
			}
		}
    }
}
