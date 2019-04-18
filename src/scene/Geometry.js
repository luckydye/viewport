import { Transform } from "../Math.js";
import DefaultMaterial from "../materials/DefaultMaterial.js";
import { VertexBuffer } from "./VertexBuffer.js";

const DEFAULT_MATERIAL = new DefaultMaterial();

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

	constructor(args = {}) {
		super(args);
		
        this.onCreate(args);
        
		const {
			material = DEFAULT_MATERIAL,
			uv = [0, 0],
            hidden = false,
			guide = false,
			drawmode = "TRIANGLES"
		} = args;
		
		this.uv = uv;
		this.material = material;
        this.hidden = hidden;
		this.guide = guide;
		this.drawmode = drawmode;
	}

	onCreate(args) {}

	createBuffer() {
		return new VertexBuffer(
			this.vertecies, 
			this.constructor.attributes, 
			this.drawmode
		);
	}
}
