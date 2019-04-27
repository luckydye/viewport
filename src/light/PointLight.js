import { Guide } from "../geo/Guide";

export class PointLight extends Guide {
	
	get isLight() {
		return true;
	}

	onCreate(args) {
		super.onCreate(args);

		const {
			intensity = 2.0,
			color = [1, 1, 1],
			size = 10,
		} = args;
		
		this.intensity = intensity;
		this.color = color;
		this.size = size;
	}

}