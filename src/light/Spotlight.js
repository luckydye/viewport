import { Camera } from '../scene/Camera.js';
import { mat4 } from 'gl-matrix';

export class Spotlight extends Camera {

	constructor(args) {
		super(args);

		this.name = "Spotlight";

		this.perspective = Camera.ORTHGRAPHIC;
		this.farplane = 1000;
		this.nearplane = 1;

		this.sensor = {
			width: 32,
			height: 32,
		}
	}

	get isLight() {
		return true;
	}

}
