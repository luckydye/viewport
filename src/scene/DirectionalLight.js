import { Camera } from './Camera.js';
import { mat4 } from 'gl-matrix';

export class DirectionalLight extends Camera {

	constructor(args) {
		super(args);

		this.name = "Directional Light";

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