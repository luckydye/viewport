import { Cube } from "../geo/Cube";

export class PointLight extends Cube {
	
	get isLight() { return true; }

	onCreate({
		intensity = 2.0,
		color = [1, 1, 1],
		size = 10,
	}) {
		this.intensity = intensity;
		this.color = color;
		this.size = size;

		this.scale = this.size * 0.33;
	}

}