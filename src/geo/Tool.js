import { Geometry } from "../scene/Geometry";
import { VertexBuffer } from "../scene/VertexBuffer";
import { Vec } from "../Math";
import { Guide } from "./Guide";

export class Tool extends Guide {

	get vertecies() {
		const s = 10;
		const w = 30;
		const l = 1;

		let { x, y, z } = new Vec();

		return [
			x + s, y, z,	0, 0, 1,
			x, y, z + s,	0, 0, 1,
			x, y, z,		0, 0, 1,

			x, y, z + s,	0, 1, 0,
			x, y + s, z,	0, 1, 0,
			x, y, z,		0, 1, 0,
			
			x, y, z,		1, 0, 0,
			x, y + s, z,	1, 0, 0,
			x + s, y, z,	1, 0, 0,

			// //
			// x, y, z,		1, 1, 1,
			// x, y + l, z,	1, 1, 1,
			// x, y, z + w,	1, 1, 1,
			
			// x, y, z + w,		1, 1, 1,
			// x, y + l, z + w,	1, 1, 1,
			// x, y + l, z,		1, 1, 1,

			// // //
			// x, y, z,		1, 1, 1,
			// x + l, y, z,	1, 1, 1,
			// x, y + w, z,	1, 1, 1,
			
			// x, y + w, z,		1, 1, 1,
			// x + l, y + w, z,	1, 1, 1,
			// x + l, y, z,		1, 1, 1,

			// // // //
			// x, y, z,		1, 1, 1,
			// x, y, z + l,	1, 1, 1,
			// x + w, y, z,	1, 1, 1,
			
			// x + w, y, z,		1, 1, 1,
			// x + w, y, z + l,	1, 1, 1,
			// x, y, z + l,		1, 1, 1,

			// // /\

			// x + 2, y, z + w,	1, 1, 1,
			// x, y, z + s + w,	1, 1, 1,
			// x - 2, y, z + w,	1, 1, 1,

			// x, y + 2, z + w,	1, 1, 1,
			// x, y, z + s + w,	1, 1, 1,
			// x, y - 2, z + w,	1, 1, 1,
		];
	}

	createBuffer() {
		const vertArray = this.vertecies;
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "TRIANGLES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 3, attribute: "aColor" },
		]
		return vertxBuffer;
	}

}
