import { Vec, Transform } from '../Math.js';
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
		
		this.objects = new Set();
		this.lastchange = Date.now();

		this.add(objs);

		this.add(new Spotlight({
			position: [0, -5000, -3000],
			rotation: [1.0, 0, 0],
			farplane: 10000,
			fov: 90,
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
		return [...this.objects].filter(obj => obj.constructor.name == objectConstructor.name);
	}

	getRenderableObjects(camera) {

		let arr = [...this.objects].filter(obj => {

			const pos = Vec.add(this.origin, obj.position);

			const dist = Math.sqrt(
				Math.pow(-camera.position.x - pos.x, 2) +
				Math.pow(-camera.position.z - pos.z, 2)
			);

			return !obj.hidden && dist < camera.farplane;
		});

		arr = arr.sort((a, b) => {

			const posA = Vec.add(this.origin, a.position);
			const posB = Vec.add(this.origin, b.position);

			const distA = Math.sqrt(
				Math.pow(-camera.position.x - posA.x, 2) +
				Math.pow(-camera.position.z - posA.z, 2)
			);

			const distB = Math.sqrt(
				Math.pow(-camera.position.x - posB.x, 2) +
				Math.pow(-camera.position.z - posB.z, 2)
			);

			return distB - distA;
		});

		return arr;
	}

}
