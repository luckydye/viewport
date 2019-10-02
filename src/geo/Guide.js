import PrimitivetMaterial from "../materials/PrimitiveMaterial.js";
import { Vec } from "../Math.js";
import { Geometry } from "../scene/Geometry.js";

export class Guide extends Geometry {

	onCreate(args) {
		args.guide = true;
		args.material = new PrimitivetMaterial();
	}

	get vertecies() {
		const s = this.scale * 10 || 10;
		const { x, y, z } = this.origin || new Vec();

		return [
			x, y, z + s, 0, 1, 0, 0, 1,
			x, y, z + -s, 0, 1, 0, 0, 1,
			x, y + s, z, 0, 1, 0, 1, 0,
			x, y - s, z, 0, 1, 0, 1, 0,
			x + s, y, z, 0, 1, 1, 0, 0,
			x - s, y, z, 0, 1, 1, 0, 0
		];
	}

}
