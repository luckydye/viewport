import { Grid } from '../geo/Grid.js';
import { Vec } from '../Math.js';
import { Cursor } from '../geo/Cursor';
import { Spotlight } from '../light/Spotlight.js';

export class Scene {

	objects = new Set();

	constructor(camera) {

		this.lightSources = new Spotlight({ 
            fov: 90,
            position: new Vec(500, -2500, -1500),
			rotation: new Vec(0.8, 0.4, 0),
		});

		this.activeCamera = camera;

		this.grid = new Grid(100, 25);
		this.curosr = new Cursor();

		this.clear();
	}

	add(obj) {
		if(Array.isArray(obj)) {
			obj.forEach(o => this.objects.add(o));
		} else {
			this.objects.add(obj);
		}
	}

	remove(obj) {
		if(Array.isArray(obj)) {
			obj.forEach(o => this.objects.delete(o));
		} else {
			this.objects.delete(obj);
		}
	}

	clear() {
		this.objects.clear();
	}

	update(ms) {
		if(this.activeCamera) {
			this.activeCamera.update(ms);
		}
		if(this.lightSources) {
			this.lightSources.update(ms);
		}

		for(let obj of this.objects) {
			if(obj.update) {
				obj.update(ms);
			}
		}
	}

	getRenderableObjects() {
		let arr = [...this.objects].filter(obj => {
			return !obj.hidden;
		});
		if(!this.curosr.hidden) {
			arr.push(this.curosr);
		}
		if(!this.grid.hidden) {
			arr.push(this.grid);
		}
		return arr;
	}

}
