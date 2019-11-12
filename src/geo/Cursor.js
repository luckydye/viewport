import { Vec } from "../Math.js";
import { Guide } from "./Guide.js";

export class Cursor extends Guide {

	onCreate(args) {
		super.onCreate(args);
		
		this.scale = 1;
	}

	get vertecies() {
		return [
			0, 0, 0, 0, 0, 1, 0, 0,
			1, 0, 0, 0, 0, 1, 0, 0,

			0, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 1, 0,

			0, 0, 0, 0, 0, 0, 0, 1,
			0, 0, 1, 0, 0, 0, 0, 1,
		];
	}

}
