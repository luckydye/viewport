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
		this.vertArray = vertArray;
		this.attributes = {};
	}

	clear() {
		this.vertecies = new Float32Array([]);
		this.vertArray = [];
	}

	static create(...args) {
		return new VertexBuffer(...args);
	}

}