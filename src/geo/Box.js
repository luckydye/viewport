import { Cube } from "./Cube.js";

export class Box extends Cube {

	onCreate(args) {
        super.onCreate(args);

        this.name = "Box";

        this.top = args.top || 1;
        this.bottom = args.bottom || -1;
        this.left = args.left || 1;
        this.right = args.right || -1;
        this.front = args.front || 1;
        this.back = args.back || -1;
	}

	get faces() {
		const s = 1 / 2;
		const w = this.back - this.front;
		const h = this.bottom - this.top;

		const u = this.uv[0];
		const v = this.uv[1];

		const x = 0;
		const y = 0;
		const z = 0;

		return {
			TOP: [
				s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 0, 1, 0,
				s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 0, 0, 1, 0,
				-s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 0, 1, 0,

				s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 0, 1, 0,
				-s * w + x, s * w + y, -s * h + z, 0 + u, 0 + v, 0, 0, 1, 0,
				-s * w + x, s * w + y, s * h + z, 0 + u, 1 + v, 0, 0, 1, 0,
			],
			BOTTOM: [
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, 0, -1, 0,
				s * w + x, -s * w + y, -s * h + z, 1 + u, 0 + v, 0, 0, -1, 0,
				s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, 0, -1, 0,

				-s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 0, 0, -1, 0,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, 0, -1, 0,
				s * w + x, -s * w + y, s * h + z, 1 + u, 1 + v, 0, 0, -1, 0,
			],
			LEFT: [
				-s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 0, 1,
				s * w + x, -s * h + y, s * w + z, 1 + u, 0 + v, 0, 0, 0, 1,
				s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 0, 1,

				-s * w + x, s * h + y, s * w + z, 0 + u, 1 + v, 0, 0, 0, 1,
				-s * w + x, -s * h + y, s * w + z, 0 + u, 0 + v, 0, 0, 0, 1,
				s * w + x, s * h + y, s * w + z, 1 + u, 1 + v, 0, 0, 0, 1,
			],
			RIGHT: [
				s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, 0, -1,
				s * w + x, -s * h + y, -s * w + z, 1 + u, 0 + v, 0, 0, 0, -1,
				-s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, 0, -1,

				s * w + x, s * h + y, -s * w + z, 1 + u, 1 + v, 0, 0, 0, -1,
				-s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v, 0, 0, 0, -1,
				-s * w + x, s * h + y, -s * w + z, 0 + u, 1 + v, 0, 0, 0, -1,
			],
			FRONT: [
				s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, 0,
				s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 0, 1, 0, 0,
				s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, 0,

				s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 0, 1, 0, 0,
				s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, 1, 0, 0,
				s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, 1, 0, 0,
			],
			BACK: [
				-s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0, 0,
				-s * w + x, s * w + y, -s * h + z, 1 + u, 0 + v, 0, -1, 0, 0,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, 0,

				-s * w + x, s * w + y, s * h + z, 1 + u, 1 + v, 0, -1, 0, 0,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v, 0, -1, 0, 0,
				-s * w + x, -s * w + y, s * h + z, 0 + u, 1 + v, 0, -1, 0, 0,
			]
		}
	}
}
