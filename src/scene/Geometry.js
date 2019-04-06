import { Transform } from "../Math.js";

export class Geometry extends Transform {

	get buffer() {
		this._buffer = this._buffer || this.createBuffer();
		return this._buffer;
	}

	constructor(args = {}) {
		const {
			material = null,
			uv = [0, 0],
			hidden = false
		} = args;
		
		super(args);

		this.mat = material;
		this.uv = uv;
		this.hidden = hidden;
		
		this.onCreate(args);
    }

	onCreate(args) { }

	createBuffer() { }
}
