import { Camera } from '../scene/Camera.js';

export class Spotlight extends Camera {
	
	constructor(args) {
		super(args = {
			position: [0, -1200, -1000],
			rotation: [0.8, 0, 0],
			fov: 50
		});
	}

	get isLight() {
		return true;
	}

}
