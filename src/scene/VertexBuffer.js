export class VertexBuffer {
	
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

	constructor(vertArray) {
		this.type = "TRIANGLES";
		this.vertecies = new Float32Array(vertArray);
		this.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
			{ size: 3, attribute: "aNormal" },
		];
	}

	clear() {
		this.vertecies = new Float32Array([]);
	}

	static create(...args) {
		return new VertexBuffer(...args);
	}

}