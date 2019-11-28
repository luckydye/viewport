import { Vec, Transform, uuidv4 } from '../Math.js';
import { Spotlight } from '../light/Spotlight.js';
import { Camera } from './Camera.js';
import { Entity } from './Entity.js';

export class Scene extends Transform {

	get cameras() {
		return this.getObjectsByConstructor(Camera);
	}

	get lightsource() {
		if(!this._lightsource) {
			this._lightsource = [...this.objects].filter(obj => obj.isLight)[0];
		}
		return this._lightsource;
	}

	constructor(objs = []) {
		super();

		this.uid = uuidv4();

		this._lightsource = null;
		
		this.objects = new Set();
		this.lastchange = Date.now();

		this.add(objs);

		this.add(new Spotlight({
			position: [0, -50, -45],
			rotation: [45 * Math.PI / 180, 0, 0],
		}));
	}

	add(obj) {
		if (Array.isArray(obj)) {
			obj.forEach(o => {
				if(o) {
					this.objects.add(o);
				}
			});
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
			if (obj instanceof Entity) {
				obj.update(ms);
			}
		}
	}

	getObjectsByConstructor(objectConstructor) {
		return [...this.objects].filter(obj => obj.constructor == objectConstructor);
	}

	getRenderableObjects(camera) {
		return [...this.objects].filter(obj => !obj.hidden).sort((a, b) => {

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
	}

}
