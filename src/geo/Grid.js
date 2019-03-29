import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../graphics/VertexBuffer.js";

export class Grid extends Geometry {

	constructor(size, count) {
		super();
		this.size = size;
		this.count = count;
	}

	createBuffer() {
		const vertArray = this.generate(this.size, this.count);
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "LINES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" }
		]
		return vertxBuffer;
	}
	
	generate(w = 100, s = 14) {
		const dataArray = [];
		const size = w * s / 2;
		for(let x = -s/2; x <= s/2; x++) {
			dataArray.push(...[
				w * x, 0, size,
				w * x, 0, -size,
			])
		}
		for(let z = -s/2; z <= s/2; z++) {
			dataArray.push(...[
				size, 0, w * z,
				-size, 0, w * z,
			])
		}
		return dataArray;
	}
}
