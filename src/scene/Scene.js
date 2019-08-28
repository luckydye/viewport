import { Grid } from '../geo/Grid.js';
import { Vec } from '../Math.js';
import { Cursor } from '../geo/Cursor';
import { Spotlight } from '../light/Spotlight.js';
import { Camera } from './Camera.js';

export class Scene {

	constructor(camera) {
		this.objects = new Set();

		this.activeCamera = camera || new Camera();

		this.clear();
	}

	add(obj) {
		if (Array.isArray(obj)) {
			obj.forEach(o => this.objects.add(o));
		} else {
			this.objects.add(obj);
		}
	}

	remove(obj) {
		if (Array.isArray(obj)) {
			obj.forEach(o => this.objects.delete(o));
		} else {
			this.objects.delete(obj);
		}
	}

	clear() {
		this.objects.clear();
	}

	update(ms) {
		if (this.activeCamera) {
			this.activeCamera.update(ms);
		}

		for (let obj of this.objects) {
			if (obj.update) {
				obj.update(ms);
			}
		}
	}

	getRenderableObjects() {
		let arr = [...this.objects].filter(obj => {
			return !obj.hidden;
		});
		return arr;
	}

}
