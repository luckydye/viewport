import { Transform } from "../Math.js";
import DefaultMaterial from "../materials/DefaultMaterial.js";

export class Geometry extends Transform {

	static get attributes() {
		return [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
			{ size: 3, attribute: "aNormal" },
		]
	}

	get buffer() {
		this._buffer = this._buffer || this.createBuffer();
		return this._buffer;
	}

	get vertecies() {
		return this.vertArray || [];
	}

	get indecies() {
		return [];
	}

	constructor(args = {}) {
		super(args);

		this._buffer = null;

		this.instanced = false;
		this.instances = 0;

		this.onCreate(args);

		const {
			vertecies = null,
			material = null,
			hidden = false,
			guide = false,
			uv = [0, 0],
		} = args;

		this.vertArray = vertecies;
		this.material = material;
		this.hidden = hidden;
		this.guide = guide;
		this.uv = uv;
	}

	onCreate(args) { }

	createBuffer() {
		return new VertexBuffer(
			this.vertecies,
			this.indecies,
			this.constructor.attributes
		);
	}
}

class VertexBuffer {

	get vertsPerElement() {
		return this.vertecies.length / this.elements;
	}

	get elements() {
		let count = 0;
		for (let key in this.attributes) {
			count += this.attributes[key].size;
		}
		return count;
	}

	constructor(vertArray, indexArray, attributes) {

		this.vertecies = new Float32Array(vertArray);
		this.indecies = new Uint16Array(indexArray);

		this.attributes = attributes;
	}

}
