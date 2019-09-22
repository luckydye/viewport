import { Vec, Transform } from '../Math.js';
import { Spotlight } from '../light/Spotlight.js';
import { Camera } from './Camera.js';

export class Scene extends Transform {

	constructor(camera) {
		super();
		
		this.objects = new Set();

		this.activeCamera = camera || new Camera();
		this.lightSources = new Spotlight({
			fov: 90,
		});

		this.lastchange = Date.now();

		this.clear();
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
		if (this.activeCamera) {
			this.activeCamera.update(ms);
		}

		// const position = new Vec(
		// 	this.activeCamera.worldPosition.x,
		// 	0,
		// 	this.activeCamera.worldPosition.z,
		// );

		// const lightoffset = new Vec(Math.sin(performance.now() * 0.001) * 500.0, 250.0, Math.cos(performance.now() * 0.001) * 300.0);

		// this.lightSources.position = Vec.add(position, Vec.multiply(lightoffset, new Vec(5.0, 5.0, 5.0)));
		// this.lightSources.lookAt = position;

		// this.lightSources.origin.x = -this.activeCamera.worldPosition.x;
		// this.lightSources.origin.Y = -this.activeCamera.worldPosition.y;
		// this.lightSources.origin.z = -this.activeCamera.worldPosition.z;

		if (this.lightSources) {
			this.lightSources.update(ms);
		}

		for (let obj of this.objects) {
			if (obj.update) {
				obj.update(ms);
			}
		}
	}

	getRenderableObjects() {
		let arr = [...this.objects].filter(obj => {

			const pos = Vec.add(this.origin, obj.position);

			const dist = Math.sqrt(
				Math.pow(-this.activeCamera.position.x - pos.x, 2) +
				Math.pow(-this.activeCamera.position.z - pos.z, 2)
			);

			return !obj.hidden && dist < this.activeCamera.farplane;
		});

		arr = arr.sort((a, b) => {

			const posA = Vec.add(this.origin, a.position);
			const posB = Vec.add(this.origin, b.position);

			const distA = Math.sqrt(
				Math.pow(-this.activeCamera.position.x - posA.x, 2) +
				Math.pow(-this.activeCamera.position.z - posA.z, 2)
			);

			const distB = Math.sqrt(
				Math.pow(-this.activeCamera.position.x - posB.x, 2) +
				Math.pow(-this.activeCamera.position.z - posB.z, 2)
			);

			return distB - distA;
		});

		return arr;
	}

}
