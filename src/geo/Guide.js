import PrimitivetMaterial from "../materials/PrimitiveMaterial";
import { Vec } from "../Math";
import { Geometry } from "../scene/Geometry";

const DEFAULT_GUIDE_MATERIAL = new PrimitivetMaterial();

export class Guide extends Geometry {

	onCreate(args) {
		args.guide = true;
		args.material = DEFAULT_GUIDE_MATERIAL;
	}

	get vertecies() {
		const s = this.scale * 10 || 10;
		const { x, y, z } = this.origin || new Vec();

		return [
			x, y, z + s, 0, 1, 1, 1, 1,
			x, y, z + -s, 0, 1, 1, 1, 1,
			x, y + s, z, 0, 1, 1, 1, 1,
			x, y - s, z, 0, 1, 1, 1, 1,
			x + s, y, z, 0, 1, 1, 1, 1,
			x - s, y, z, 0, 1, 1, 1, 1
		];
	}

}
