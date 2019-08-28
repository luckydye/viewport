import DefaultMaterial from "../materials/DefaultMaterial";
import { Geometry } from "../scene/Geometry";

const DEFAULT_GUIDE_MATERIAL = new DefaultMaterial();

export class Vector extends Geometry {

	onCreate(args) {
		args.guide = true;
		args.material = DEFAULT_GUIDE_MATERIAL;

		args.points = args.points || [];
		this.points = args.points;
		this.color = [1, 1, 1];
	}

	update() {
		this._buffer = null;
	}

	get vertecies() {
		const vertArray = [];
		for (let p of this.points) {
			const { x, y, z } = p;
			vertArray.push(x, y, z, 0, 0, ...this.color);
		}
		return vertArray;
	}

}
