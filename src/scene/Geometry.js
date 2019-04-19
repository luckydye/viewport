import { Transform } from "../Math.js";
import DefaultMaterial from "../materials/DefaultMaterial.js";

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

	get vertecies() {
		return [];
	}

	get indecies() {
		return [];
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

	onCreate(args) {

	}

	createBuffer() {
		return new VertexBuffer(
			this.vertecies, 
			this.indecies, 
			this.constructor.attributes, 
			this.drawmode
		);
	}
}

class VertexBuffer {
	
	get vertsPerElement() {
		return this.vertecies.length / this.elements;
	}

	get elements() {
		let count = 0;
		for(let key in this.attributes) {
			count += this.attributes[key].size;
		}
		return count;
	}

	constructor(vertArray, indexArray, attributes, type) {

		this.vertecies = new Float32Array(vertArray);
		this.indecies = new Uint16Array(indexArray);

		this.attributes = attributes || [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
			{ size: 3, attribute: "aNormal" },
		];
		
		this.type = type || "TRIANGLES";
	}

}
