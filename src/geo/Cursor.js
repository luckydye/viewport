import { Vec } from "../Math.js";
import { Guide } from "./Guide.js";

export class Cursor extends Guide {

	onCreate(args) {
		super.onCreate(args);
		
		this.scale = 1;
	}

	get vertecies() {
		const s = 0.75;

		let { x, y, z } = new Vec();

		return [
			x + s, y, z, 0, 0, 0, 0, 1,
			x, y, z + s, 0, 0, 0, 0, 1,
			x, y, z, 0, 0, 0, 0, 1,

			x, y, z + s, 0, 0, 0, 1, 0,
			x, y + s, z, 0, 0, 0, 1, 0,
			x, y, z, 0, 0, 0, 1, 0,

			x, y, z, 0, 0, 1, 0, 0,
			x, y + s, z, 0, 0, 1, 0, 0,
			x + s, y, z, 0, 0, 1, 0, 0,
		];
	}

}
