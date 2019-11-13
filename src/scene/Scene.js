import { Vec, Transform, uuidv4 } from '../Math.js';
import { Spotlight } from '../light/Spotlight.js';
import { Camera } from './Camera.js';

export class Scene extends Transform {

	get cameras() {
		return this.getObjectsByConstructor(Camera);
	}

	get lightsource() {
		return this.getObjectsByConstructor(Spotlight)[0];
	}

	constructor(objs = []) {
		super();

		this.uid = uuidv4();
		
		this.objects = new Set();
		this.lastchange = Date.now();

		this.add(objs);

		this.add(new Spotlight({
			position: [8, -30, 0],
			rotation: [(3.14 / 2) - 0.5, -0.1, -0.33],
		}));
	}

	add(obj) {
		if (Array.isArray(obj)) {
			obj.forEach(o => this.objects.add(o));
		} else {
			this.objects.add(obj);
		}

		this.lastchange = Date.now();
	}

	remove(obj) {
		if (Array.isArray(obj)) {
			obj.forEach(o => this.objects.delete(o));
		} else {
			this.objects.delete(obj);
		}

		this.lastchange = Date.now();
	}

	clear() {
		this.objects.clear();
	}

	update(ms) {
		for (let obj of this.objects) {
			if (obj.update) {
				obj.update(ms);
			}
		}
	}

	getObjectsByConstructor(objectConstructor) {
		return [...this.objects].filter(obj => obj.constructor == objectConstructor);
	}

	getRenderableObjects(camera) {

		let arr = [...this.objects].filter(obj => {

			const dist = Math.sqrt(
				Math.pow(-camera.position.x - (this.origin.x + obj.position.x), 2) +
				Math.pow(-camera.position.z - (this.origin.z + obj.position.z), 2)
			);

			return !obj.hidden && dist < camera.farplane;
		});

		arr = arr.sort((a, b) => {

			const distA = Math.sqrt(
				Math.pow(-camera.position.x - (this.origin.x + a.position.x), 2) +
				Math.pow(-camera.position.z - (this.origin.z + a.position.z), 2)
			);

			const distB = Math.sqrt(
				Math.pow(-camera.position.x - (this.origin.x + b.position.x), 2) +
				Math.pow(-camera.position.z - (this.origin.z + b.position.z), 2)
			);

			return distB - distA;
		});

		return arr;
	}

}
