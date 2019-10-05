import { Camera } from '../scene/Camera.js';

export class Spotlight extends Camera {
	
	constructor(args) {
		super(args);

		this.perspective = Camera.ORTHGRAPHIC;
		this.farplane = 10000;
		this.nearplane = 10;

		this.sensor = {
			width: 4096,
			height: 4096,
		}
	}

	get isLight() {
		return true;
	}

}
