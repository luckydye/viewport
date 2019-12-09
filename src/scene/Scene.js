import Config from '../Config.js';
import { Box } from '../geo/Box.js';
import { Transform, uuidv4 } from '../Math.js';
import { Emitter } from '../entities/Emitter.js';
import Player from '../entities/Player.js';
import Static from '../entities/Static.js';
import { Camera } from './Camera.js';
import { DirectionalLight } from './DirectionalLight.js';
import { Entity } from './Entity.js';
import Prop from './Prop.js';
import { Geometry } from './Geometry.js';
import { Cube } from '../geo/Cube.js';
import { Guide } from '../geo/Guide.js';
import { Plane } from '../geo/Plane.js';
import { Vector } from '../geo/Vector.js';
import { Group } from '../geo/Group.js';

const config = Config.global;

config.define('show.hitbox', 0, 0);

Prop.register('prop_player', Player);
Prop.register('prop_static', Static);

Prop.register('entity', Entity);
Prop.register('entity_camera', Camera);
Prop.register('entity_directional_light', DirectionalLight);
Prop.register('entity_emitter', Emitter);

Prop.register('geometry', Geometry);
Prop.register('geometry_box', Box);
Prop.register('geometry_cube', Cube);
Prop.register('geometry_guide', Guide);
Prop.register('geometry_plane', Plane);
Prop.register('geometry_vector', Vector);
Prop.register('geometry_group', Group);

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
		const top = entity.hitbox[0] + entity.position[1];
		const right = entity.hitbox[1] + entity.position[0];
		const bottom = entity.hitbox[2] + entity.position[1];
		const left = entity.hitbox[3] + entity.position[0];
		const front = entity.position[2] - entity.hitbox[4];
		const back = entity.position[2] + entity.hitbox[4];

		const top2 = collider.hitbox[0] + collider.position[1];
		const right2 = collider.hitbox[1] + collider.position[0];
		const bottom2 = collider.hitbox[2] + collider.position[1];
		const left2 = collider.hitbox[3] + collider.position[0];
		const front2 = collider.position[2] - collider.hitbox[4];
		const back2 = collider.position[2] + collider.hitbox[4];

		const horizontal = (right > left2 && right < right2 || left < right2 && left > left2);
		const vertical = (bottom < top2 && bottom > bottom2 || top > bottom2 && top < top2);
		const depth = (back > front2 && back < back2 || front < back2 && front > front2);

		let collidesX = null;
		let collidesY = null;

		// top edge collides
		if (top > bottom2 && top < top2 && horizontal && depth) {
			collidesY = 0;
		}

		// bottom edge collides
		if (bottom < top2 && bottom > bottom2 && horizontal && depth) {
			collidesY = 2;
		}

		// left edge collides
		if (left > left2 && left < right2 && vertical && depth) {
			collidesX = 3;
		}

		// right edge collides
		if (right > left2 && right < right2 && vertical && depth) {
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
			if(!obj.guide) {
				parents[obj.uid] = {
					name: obj.name,
					uid: obj.uid,
					object: obj,
					children: [],
				};
			}
		}

		for(let obj of this.objects) {
			if(!obj.guide) {
				if(obj.parent) {
					const parent = parents[obj.parent.uid];
					parent.children.push(parents[obj.uid]);
				} else {
					scene_graph.push(parents[obj.uid]);
				}
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
