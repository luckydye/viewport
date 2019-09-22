import { Camera } from '../scene/Camera.js';

export class Spotlight extends Camera {
	
	constructor(args) {
		super(args = {
			position: [0, -5000, 0],
			rotation: [0.8, 0, 0],
			farplane: 10000,
			fov: 90
		});
	}

	get isLight() {
		return true;
	}

}
