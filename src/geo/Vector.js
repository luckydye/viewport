import DefaultMaterial from "../materials/DefaultMaterial.js";
import { Geometry } from "../scene/Geometry.js";

export class Vector extends Geometry {

	onCreate(args) {
		args.guide = true;
		args.material = new DefaultMaterial();

		args.points = args.points || [];
		this.points = args.points;
		this.color = [1, 1, 1];
	}

	get vertecies() {
		const vertArray = [];
		for (let p of this.points) {
			const { x, y, z } = p;
			vertArray.push(x, y, z, 0, 0, 0, ...this.color);
		}
		return vertArray;
	}

}
