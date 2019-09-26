import { Camera } from '../scene/Camera.js';

export class Spotlight extends Camera {
	
	constructor(args) {
		super(args);
	}

	get isLight() {
		return true;
	}

}
