import { mat4, vec3 } from 'gl-matrix';
import { Camera } from '../scene/Camera.js';

export class Spotlight extends Camera {

	get isLight() {
		return true;
	}

}
