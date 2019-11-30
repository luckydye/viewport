import { Vec, Transform, uuidv4 } from '../Math.js';
import { DirectionalLight } from './DirectionalLight.js';
import { Camera } from './Camera.js';
import { Entity } from './Entity.js';
import { Guide } from '../geo/Guide.js';
import { Box } from '../geo/Box.js';
import Config from '../Config.js';

const config = Config.global;

config.define('show_hitbox', 0, 0);

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
						o.hitbox_ = new Box({ 
							top: o.hitbox[0], 
							right: o.hitbox[1],
							bottom: o.hitbox[2], 
							left: o.hitbox[3],
							depth: o.hitbox[4],
							parent: o,
						});

						if(config.getValue('show_hitbox')) {
							this.objects.add(o.hitbox_);
						}
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

			if(obj.hitbox) {
				for (let collider of this.objects) {
					if (collider.hitbox && collider.collider && collider !== obj) {
						if(this.intersectsRect(collider, obj)) collider.intersects(obj);
					}
				}
			}

			if (obj instanceof Entity) {
				obj.update(ms);
			}
		}
	}

	intersectsRect(entity, collider2) {
		const top1 = entity.hitbox[0] + entity.position.y;
		const right1 = entity.hitbox[1] + entity.position.x;
		const bottom1 = entity.hitbox[2] + entity.position.y;
		const left1 = entity.hitbox[3] + entity.position.x;

		const top2 = collider2.hitbox[0] + collider2.position.y;
		const right2 = collider2.hitbox[1] + collider2.position.x;
		const bottom2 = collider2.hitbox[2] + collider2.position.y;
		const left2 = collider2.hitbox[3] + collider2.position.x;

		if (bottom1 < top2 && (left1 > left2 && left1 < right2) || (right1 > left2 && right1 < right2)) {
			return true;
		}

		// if (right1 > left2 && top1 < top2 && top1 > bottom2) {
		// 	return true;
		// }

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
