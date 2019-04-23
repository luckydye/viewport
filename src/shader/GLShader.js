export class GLShader {

	static vertexSource() {}
	static fragmentSource() {}

	get vertexShader() { return this._vertShader; }
	get fragementShader() { return this._fragShader; }

	get uniforms() { return this._uniforms; }
	get attributes() { return this._attributes; }

	get source() {
		return [
			this.constructor.vertexSource(),
			this.constructor.fragmentSource()
		];
	}

	_vertShader = null;
	_fragShader = null;

	_uniforms = null;
	_attributes = null;

	_uniform = {};
	_initialized = false;

	setUniforms(gl) {
		const uniforms = this.uniforms;
		if(uniforms) {
			for(let opt in this._uniform) {
				const value = this._uniform[opt];
				if(opt === "integer") {
					for(let opt in this._uniform.integer) {
						gl.uniform1i(uniforms[opt], this._uniform.integer[opt]);
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
