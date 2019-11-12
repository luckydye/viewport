import { Texture } from "../materials/Texture.js";

export class Shader {

	static jsObjectToGLSLStruct(name, obj) {
		const str = `struct ${name} {`;
		for(let key in obj) {
			str += obj[key] + " " + key;
		}
		return str + '}';
	}

	static vertexSource() { }
	static fragmentSource() { }

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

	constructor() {
		this._vertShader = null;
		this._fragShader = null;

		this._uniforms = null;
		this._attributes = null;

		this.drawmode = "TRIANGLES";

		this.program = null;
		this.gl = null;

		this.initialized = false;

		this.cache = {};
	}

	cacheUniform(key, value, target) {
		let cache = this.cache;
		let matched = false;

		if(target) {
			if(!this.cache[target]) {
				this.cache[target] = {};
			}
			cache = this.cache[target];
		}

		if(value instanceof Texture) {
			return false;

		} else if(Array.isArray(value)) {
			value = value.reduce((a,b) => a+b);
		}
		
		matched = cache[key] === value;
		cache[key] = value;

		return matched;
	}

	setUniforms(attributes, target) {
		const uniforms = this._uniforms;
		const gl = this.gl;

		for (let key in attributes) {
			let opt = key;

			if (target != null) {
				opt = target + '.' + key;
			}

			const value = attributes[key];
			const uniform = uniforms[opt];

			if(this.cacheUniform(key, value, target)) 
				continue;

			if (Array.isArray(value)) {

				// catch 2d array matrix
				if (Array.isArray(value[0])) {
					const size = value.length;
					gl['uniformMatrix' + size + 'fv'](uniform, false, value.flat());
				}

				else if (value.length === 4) {
					gl.uniform4fv(uniform, value);
				} else if (value.length === 3) {
					gl.uniform3fv(uniform, value);
				} else if (value.length === 4 * 4) {
					gl['uniformMatrix4fv'](uniform, false, value.flat());
				} else {
					gl.uniform2fv(uniform, value);
				}

			} else {
				const type = typeof value;
				switch (type) {
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
