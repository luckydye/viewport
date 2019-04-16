import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../scene/VertexBuffer";

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
			{ size: 3, attribute: "aPosition" },
			{ size: 3, attribute: "aColor" },
		]
		return vertxBuffer;
	}
	
	generate(w = 100, s = 14) {
		const dataArray = [];
		const size = w * s / 2;
		for(let x = -s/2; x <= s/2; x++) {
			let color = [0.5, 0.5, 0.5];
			if(x == 0) color = [.15, .15, 1];

			dataArray.push(...[
				w * x, 0, size, ...color,
				w * x, 0, -size, ...color
			])
		}
		for(let z = -s/2; z <= s/2; z++) {
			let color = [0.5, 0.5, 0.5];
			if(z == 0) color = [1, .15, .15];

			dataArray.push(...[
				size, 0, w * z, ...color,
				-size, 0, w * z, ...color
			])
		}
		return dataArray;
	}
}
