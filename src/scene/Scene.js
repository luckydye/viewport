import { Vec, Transform, uuidv4 } from '../Math.js';
import { DirectionalLight } from './DirectionalLight.js';
import { Camera } from './Camera.js';
import { Entity } from './Entity.js';
import { Guide } from '../geo/Guide.js';
import { Box } from '../geo/Box.js';

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

		this.add(new DirectionalLight({
			position: [0, -50, -45],
			rotation: [45 * Math.PI / 180, 0, 0],
		}));
	}

	add(obj) {
		if (Array.isArray(obj)) {
			obj.forEach(o => {
				if(o) {
					this.objects.add(o);

					if(o.hitbox) {
						const top = o.hitbox[0] + o.position.y;
						const right = o.hitbox[1] + o.position.x;
						const bottom = o.hitbox[2] + o.position.y;
						const left = o.hitbox[3] + o.position.x;

						this.objects.add(new Box({ top, left, right, bottom,
							position: [0, 0, 2.1]
						}))
					}
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

			if(obj.hitbox) {
				for (let obj2 of this.objects) {
					if (obj2 instanceof Entity) {
						if(obj2.collider) {
							if(this.intersects(obj, obj2)) {
								obj2.intersects(obj);
							}
						}
					}
				}
			}
		}
	}

	intersects(geo, entity) {
		const top = geo.hitbox[0] + geo.position.y;
		const right = geo.hitbox[1] + geo.position.x;
		const bottom = geo.hitbox[2] + geo.position.y;
		const left = geo.hitbox[3] + geo.position.x;

		if (entity.position.x > left && entity.position.x < right &&
			entity.position.y > top && entity.position.y < bottom) {

			return true;
		}

		return false;
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
