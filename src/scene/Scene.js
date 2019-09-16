import { Grid } from '../geo/Grid.js';
import { Vec } from '../Math.js';
import { Spotlight } from '../light/Spotlight.js';
import { Camera } from './Camera.js';

export class Scene {

	constructor(camera) {
		this.objects = new Set();

		this.activeCamera = camera || new Camera();
		this.lightSources = new Spotlight({
			fov: 90,
			oribting: true,
		});

		this.lightSources.perspective = Camera.ORTHGRAPHIC;

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

		const position = new Vec(
			this.activeCamera.worldPosition.x,
			0,
			this.activeCamera.worldPosition.z,
		);

		const lightoffset = new Vec(Math.sin(performance.now() * 0.001) * 500.0, 250.0, Math.cos(performance.now() * 0.001) * 300.0);

		this.lightSources.position = Vec.add(position, Vec.multiply(lightoffset, new Vec(5.0, 5.0, 5.0)));
		this.lightSources.lookAt = position;

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

			const dist = Math.sqrt(
				Math.pow(-this.activeCamera.position.x - obj.position.x, 2) +
				Math.pow(-this.activeCamera.position.z - obj.position.z, 2)
			);

			return !obj.hidden && dist < this.activeCamera.farplane;
		});

		arr = arr.sort((a, b) => {

			const distA = Math.sqrt(
				Math.pow(-this.activeCamera.position.x - a.position.x, 2) +
				Math.pow(-this.activeCamera.position.z - a.position.z, 2)
			);

			const distB = Math.sqrt(
				Math.pow(-this.activeCamera.position.x - b.position.x, 2) +
				Math.pow(-this.activeCamera.position.z - b.position.z, 2)
			);

			return distB - distA;
		});

		return arr;
	}

}
