import { Cube } from "./Cube.js";

export class Voxel extends Cube {
	
	get faces() {
		const s = this.scale;
		const w = 10;
		const h = 10;

		const u = this.uv[0];
		const v = this.uv[1];

		const x = this.position.x;
		const y = -this.position.y;
		const z = this.position.z;

		return {
			TOP: [
				s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	0, 1, 0,
				s * w + x, s * w + y, -s * h + z, 	1 + u, 0 + v,	0, 1, 0,
				-s * w + x, s * w + y, -s * h + z, 	0 + u, 0 + v,	0, 1, 0,

				s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	0, 1, 0,
				-s * w + x, s * w + y, -s * h + z, 	0 + u, 0 + v,	0, 1, 0,
				-s * w + x, s * w + y, s * h + z, 	0 + u, 1 + v,	0, 1, 0,
			],
			BOTTOM: [
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,	0, -1, 0,
				s * w + x, -s * w + y, -s * h + z, 	1 + u, 0 + v,	0, -1, 0,
				s * w + x, -s * w + y, s * h + z, 	1 + u, 1 + v,	0, -1, 0,

				-s * w + x, -s * w + y, s * h + z, 	0 + u, 1 + v,	0, -1, 0,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,	0, -1, 0,
				s * w + x, -s * w + y, s * h + z, 	1 + u, 1 + v,	0, -1, 0,
			],
			LEFT: [
				-s * w + x, -s * h + y, s * w + z, 	0 + u, 0 + v,	0, 0, 1,
				s * w + x, -s * h + y, s * w + z, 	1 + u, 0 + v,	0, 0, 1,
				s * w + x, s * h + y, s * w + z, 	1 + u, 1 + v,	0, 0, 1,

				-s * w + x, s * h + y, s * w + z, 	0 + u, 1 + v,	0, 0, 1,
				-s * w + x, -s * h + y, s * w + z, 	0 + u, 0 + v,	0, 0, 1,
				s * w + x, s * h + y, s * w + z, 	1 + u, 1 + v,	0, 0, 1,
			],
			RIGHT: [
				s * w + x, s * h + y, -s * w + z, 	1 + u, 1 + v,	0, 0, -1,
				s * w + x, -s * h + y, -s * w + z, 	1 + u, 0 + v,	0, 0, -1,
				-s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v,	0, 0, -1,

				s * w + x, s * h + y, -s * w + z, 	1 + u, 1 + v,	0, 0, -1,
				-s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v,	0, 0, -1,
				-s * w + x, s * h + y, -s * w + z, 	0 + u, 1 + v,	0, 0, -1,
			],
			FRONT: [
				s * w + x, -s * w + y, -s * h + z, 	0 + u, 0 + v,	1, 0, 0,
				s * w + x, s * w + y, -s * h + z, 	1 + u, 0 + v,	1, 0, 0,
				s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	1, 0, 0,
				
				s * w + x, -s * w + y, s * h + z, 	0 + u, 1 + v,	1, 0, 0,
				s * w + x, -s * w + y, -s * h + z, 	0 + u, 0 + v,	1, 0, 0,
				s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	1, 0, 0,
			],
			BACK: [
				-s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	-1, 0, 0,
				-s * w + x, s * w + y, -s * h + z, 	1 + u, 0 + v,	-1, 0, 0,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,	-1, 0, 0,

				-s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	-1, 0, 0,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,	-1, 0, 0,
				-s * w + x, -s * w + y, s * h + z, 	0 + u, 1 + v,	-1, 0, 0,
			]
		}
	}
}
