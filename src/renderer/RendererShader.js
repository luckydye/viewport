import { Texture } from "../materials/Texture.js";

export class Shader {

	static blur9() {
		return `
			vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
				vec4 color = vec4(0.0);
				vec2 off1 = vec2(1.3846153846) * direction;
				vec2 off2 = vec2(3.2307692308) * direction;
				color += texture(image, uv) * 0.2270270270;
				color += texture(image, uv + (off1 / resolution)) * 0.3162162162;
				color += texture(image, uv - (off1 / resolution)) * 0.3162162162;
				color += texture(image, uv + (off2 / resolution)) * 0.0702702703;
				color += texture(image, uv - (off2 / resolution)) * 0.0702702703;
				return color;
			}
		`;
	}

	static jsObjectToGLSLStruct(name, obj) {
		const str = `
			struct ${name} {
		`;
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

		this.initialized = false;
	}

	setUniforms(renderer, attributes, target) {
		const uniforms = this._uniforms;
		const gl = renderer.gl;

		let textureSlots = 0;
		let textures = [];

		for (let key in attributes) {
			let opt = key;

			if (target != null) {
				opt = target + '.' + key;
			}

			const value = attributes[key];
			const uniform = uniforms[opt];

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

			} else if (value instanceof Texture) {
				textures.push({
					texture: value,
					uniformloc: opt
				});
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

		for (let tex of textures) {
			const texture = tex.texture || Texture.EMPTY;

			renderer.prepareTexture(texture);
			renderer.useTexture(texture, tex.uniformloc, textureSlots);
			textureSlots++;
		}
	}
}
