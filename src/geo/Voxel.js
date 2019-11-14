import { Cube } from "./Cube.js";

export class Voxel extends Cube {
	
	get faces() {
		const s = 1;
		const w = 1;
		const h = 1;

		const u = this.uv[0];
		const v = this.uv[1];
		const us = this.uv[2];
		const vs = this.uv[3];

		const x = this.position.x;
		const y = -this.position.y;
		const z = this.position.z;

		return {
			TOP: [
				s * w + x, s * w + y, s * h + z, 	(1 + u) * us, (1 + v) * vs, 0,	0, 1, 0,
				s * w + x, s * w + y, -s * h + z, 	(1 + u) * us, (0 + v) * vs, 0,	0, 1, 0,
				-s * w + x, s * w + y, -s * h + z, 	(0 + u) * us, (0 + v) * vs, 0,	0, 1, 0,

				s * w + x, s * w + y, s * h + z, 	(1 + u) * us, (1 + v) * vs, 0,	0, 1, 0,
				-s * w + x, s * w + y, -s * h + z, 	(0 + u) * us, (0 + v) * vs, 0,	0, 1, 0,
				-s * w + x, s * w + y, s * h + z, 	(0 + u) * us, (1 + v) * vs, 0,	0, 1, 0,
			],
			BOTTOM: [
				-s * w + x, -s * w + y, -s * h + z, (0 + u) * us, (0 + v) * vs, 0,	0, -1, 0,
				s * w + x, -s * w + y, -s * h + z, 	(1 + u) * us, (0 + v) * vs, 0,	0, -1, 0,
				s * w + x, -s * w + y, s * h + z, 	(1 + u) * us, (1 + v) * vs, 0,	0, -1, 0,

				-s * w + x, -s * w + y, s * h + z, 	(0 + u) * us, (1 + v) * vs, 0,	0, -1, 0,
				-s * w + x, -s * w + y, -s * h + z, (0 + u) * us, (0 + v) * vs, 0,	0, -1, 0,
				s * w + x, -s * w + y, s * h + z, 	(1 + u) * us, (1 + v) * vs, 0,	0, -1, 0,
			],
			LEFT: [
				-s * w + x, -s * h + y, s * w + z, 	(0 + u) * us, (0 + v) * vs, 0,	0, 0, 1,
				s * w + x, -s * h + y, s * w + z, 	(1 + u) * us, (0 + v) * vs, 0,	0, 0, 1,
				s * w + x, s * h + y, s * w + z, 	(1 + u) * us, (1 + v) * vs, 0,	0, 0, 1,

				-s * w + x, s * h + y, s * w + z, 	(0 + u) * us, (1 + v) * vs, 0,	0, 0, 1,
				-s * w + x, -s * h + y, s * w + z, 	(0 + u) * us, (0 + v) * vs, 0,	0, 0, 1,
				s * w + x, s * h + y, s * w + z, 	(1 + u) * us, (1 + v) * vs, 0,	0, 0, 1,
			],
			RIGHT: [
				s * w + x, s * h + y, -s * w + z, 	(1 + u) * us, (1 + v) * vs, 0,	0, 0, -1,
				s * w + x, -s * h + y, -s * w + z, 	(1 + u) * us, (0 + v) * vs, 0,	0, 0, -1,
				-s * w + x, -s * h + y, -s * w + z, (0 + u) * us, (0 + v) * vs, 0,	0, 0, -1,

				s * w + x, s * h + y, -s * w + z, 	(1 + u) * us, (1 + v) * vs, 0,	0, 0, -1,
				-s * w + x, -s * h + y, -s * w + z, (0 + u) * us, (0 + v) * vs, 0,	0, 0, -1,
				-s * w + x, s * h + y, -s * w + z, 	(0 + u) * us, (1 + v) * vs, 0,	0, 0, -1,
			],
			FRONT: [
				s * w + x, -s * w + y, -s * h + z, 	(0 + u) * us, (0 + v) * vs, 0,	1, 0, 0,
				s * w + x, s * w + y, -s * h + z, 	(1 + u) * us, (0 + v) * vs, 0,	1, 0, 0,
				s * w + x, s * w + y, s * h + z, 	(1 + u) * us, (1 + v) * vs, 0,	1, 0, 0,
				
				s * w + x, -s * w + y, s * h + z, 	(0 + u) * us, (1 + v) * vs, 0,	1, 0, 0,
				s * w + x, -s * w + y, -s * h + z, 	(0 + u) * us, (0 + v) * vs, 0,	1, 0, 0,
				s * w + x, s * w + y, s * h + z, 	(1 + u) * us, (1 + v) * vs, 0,	1, 0, 0,
			],
			BACK: [
				-s * w + x, s * w + y, s * h + z, 	(1 + u) * us, (1 + v) * vs, 0,	-1, 0, 0,
				-s * w + x, s * w + y, -s * h + z, 	(1 + u) * us, (0 + v) * vs, 0,	-1, 0, 0,
				-s * w + x, -s * w + y, -s * h + z, (0 + u) * us, (0 + v) * vs, 0,	-1, 0, 0,

				-s * w + x, s * w + y, s * h + z, 	(1 + u) * us, (1 + v) * vs, 0,	-1, 0, 0,
				-s * w + x, -s * w + y, -s * h + z, (0 + u) * us, (0 + v) * vs, 0,	-1, 0, 0,
				-s * w + x, -s * w + y, s * h + z, 	(0 + u) * us, (1 + v) * vs, 0,	-1, 0, 0,
			]
		}
	}
}
