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

	uniform = {};
	initialized = false;

	setUniforms(gl, attributes, target) {
		const uniforms = this._uniforms;

		for(let key in attributes) {
			let opt = key;

			if(target != null) {
				opt = target + '.' + key;
			}

			const value = attributes[key];
			const uniform = uniforms[opt];

			if(Array.isArray(value)) {
				gl.uniform3fv(uniform, value);
			} else {
				const type = typeof value;
				switch(type) {
					case 'number':
						gl.uniform1f(uniform, value);
						break;
					case 'boolean':
						gl.uniform1i(uniform, value);
						break;
				}
			}
		}
	}
}
