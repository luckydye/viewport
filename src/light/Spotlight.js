import { Camera } from '../scene/Camera.js';
import { mat4 } from 'gl-matrix';

export class Spotlight extends Camera {

	constructor(args) {
		super(args);

		this.perspective = Camera.ORTHGRAPHIC;
		this.farplane = 500;
		this.nearplane = 5;

		this.sensor = {
			width: 50,
			height: 50,
		}
	}

	get isLight() {
		return true;
	}

}
