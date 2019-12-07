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

		const shadowAngle = 80;

		this.add(new DirectionalLight({
			position: [0, -100, -8],
			rotation: [shadowAngle * Math.PI / 180, 0, 0],
		}));
	}

	add(obj) {
		if (Array.isArray(obj)) {
			obj.forEach(o => {
				if(o) {
					this.objects.add(o);

					for (let trait of o.traits) {
						if(trait.onCreate) trait.onCreate(o);
					}

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

			if(obj.traits) {
				for (let trait of obj.traits) {
					if(trait.onCreate) trait.onCreate(obj);
				}
			}
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

						// intersects X
						const intersectionsX = this.intersectsRect(collider, obj);
						if(intersectionsX[0] != null) {
							collider.intersects(obj, intersectionsX[0]);
						}
						
						// intersects Y
						const intersectionsY = this.intersectsRect(collider, obj);
						if(intersectionsY[1] != null) {
							collider.intersects(obj, intersectionsY[1]);
						}
					}
				}
			}

			if (obj instanceof Entity) {
				obj.update(ms);
			}
		}
	}

	intersectsRect(entity, collider) {
		const top = entity.hitbox[0] + entity.position.y;
		const right = entity.hitbox[1] + entity.position.x;
		const bottom = entity.hitbox[2] + entity.position.y;
		const left = entity.hitbox[3] + entity.position.x;

		const top2 = collider.hitbox[0] + collider.position.y;
		const right2 = collider.hitbox[1] + collider.position.x;
		const bottom2 = collider.hitbox[2] + collider.position.y;
		const left2 = collider.hitbox[3] + collider.position.x;

		const horizontal = (right > left2 && right < right2 || left < right2 && left > left2 );
		const vertical = (bottom < top2 && bottom > bottom2 || top > bottom2 && top < top2);

		let collidesX = null;
		let collidesY = null;

		// top edge collides
		if (top > bottom2 && top < top2 && horizontal) {
			collidesY = 0;
		}

		// bottom edge collides
		if (bottom < top2 && bottom > bottom2 && horizontal) {
			collidesY = 2;
		}

		// left edge collides
		if (left > left2 && left < right2 && vertical) {
			collidesX = 3;
		}

		// right edge collides
		if (right > left2 && right < right2 && vertical) {
			collidesX = 1;
		}

		return [ collidesX, collidesY ];
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

	getSceneGraph() {
		const scene_graph = [];
		const parents = {};

		for(let obj of this.objects) {
			parents[obj.uid] = {
				name: obj.name,
				uid: obj.uid,
				object: obj,
				children: [],
			};
		}

		for(let obj of this.objects) {
			if(obj.parent) {
				const parent = parents[obj.parent.uid];
				parent.children.push(parents[obj.uid]);
			} else {
				scene_graph.push(parents[obj.uid]);
			}
		}

		scene_graph.getChildren = object => {
			for(let key in parents) {
				if(parents[key].object == object) {
					return parents[key].children;
				}
			}
		}

		return scene_graph;
	}

}
