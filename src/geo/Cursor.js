import { Vec } from "../Math.js";
import { Guide } from "./Guide.js";

export class Cursor extends Guide {

	onCreate(args) {
		super.onCreate(args);

		this.name = "Cursor";
		
		this.scale = 1;

		this.matrixAutoUpdate = true;
	}

	get vertecies() {
		return [
			0, 0, 0, 0, 0, 0, 1, 0, 0,
			1, 0, 0, 0, 0, 0, 1, 0, 0,

			0, 0, 0, 0, 0, 0, 0, 1, 0,
			0, 1, 0, 0, 0, 0, 0, 1, 0,

			0, 0, 0, 0, 0, 0, 0, 0, 1,
			0, 0, 1, 0, 0, 0, 0, 0, 1,
		];
	}

}
