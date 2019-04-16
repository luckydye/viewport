import { Transform } from "../Math.js";
import DefaultMaterial from "../materials/DefaultMaterial.js";

const DEFAULT_MATERIAL = new DefaultMaterial();

export class Geometry extends Transform {

	get buffer() {
		this._buffer = this._buffer || this.createBuffer();
		return this._buffer;
	}

	get mat() {
		return this.material;
	}

	set mat(mat) {
		this.material = mat;
	}

	constructor(args = {}) {
		super(args);
		
        this.onCreate(args);
        
		const {
			material = DEFAULT_MATERIAL,
			uv = [0, 0],
            hidden = false,
            guide = false,
		} = args;
		
		this.uv = uv;
		this.material = material;
        this.hidden = hidden;
        this.guide = guide;
	}

	onCreate(args) { }

	createBuffer() { }
}
