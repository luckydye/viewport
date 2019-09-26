import { Camera } from '../scene/Camera.js';

export class Spotlight extends Camera {
	
	constructor(args) {
		super(args);

		this.perspective = Camera.ORTHGRAPHIC;
	}

	get isLight() {
		return true;
	}

}
