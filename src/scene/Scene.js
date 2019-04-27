import { Grid } from '../geo/Grid.js';
import { DirectionalLight } from '../light/DirectionalLight';
import { Vec } from '../Math.js';
import { Cursor } from '../geo/Cursor';

export class Scene {

	_objects = new Set();

	get objects() { return this._objects; }

	constructor(camera) {

		this.lightSources = new DirectionalLight({ 
            fov: 90,
            position: new Vec(1000, 0, -10000),
			rotation: new Vec(50, 40, 0),
		});
		
		this.activeCamera = camera;

		this.grid = new Grid(100, 20);
		this.curosr = new Cursor();

		this.clear();
	}

	add(obj) {
		if(Array.isArray(obj)) {
			obj.forEach(o => this._objects.add(o));
		} else {
			this._objects.add(obj);
		}
	}

	remove(obj) {
		if(Array.isArray(obj)) {
			obj.forEach(o => this._objects.delete(o));
		} else {
			this._objects.delete(obj);
		}
	}

	clear() {
		this._objects.clear();
		this.add(this.grid);
		this.add(this.curosr);
	}

	update(ms) {
		this.activeCamera.update();

		for(let obj of this._objects) {
			if(obj.update) {
				obj.update(ms);
			}
		}
	}

}
