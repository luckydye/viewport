import { Cube } from "../geo/Cube.js";

export class PointLight extends Cube {
	
	get isLight() { return true; }

	onCreate({
		intensity = 5.0,
		color = [1, 1, 1],
		size = 10,
	}) {
		this.intensity = intensity;
		this.color = color;
		this.size = size;

		this.scale = this.size * 0.33;
	}

}