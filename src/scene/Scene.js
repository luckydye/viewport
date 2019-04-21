import { Camera } from '../camera/Camera';
import { Grid } from '../geo/Grid.js';
import { DirectionalLight } from '../light/DirectionalLight';
import { Vec } from '../Math.js';
import { Cursor } from '../geo/Cursor';

export class Scene {

	constructor({ camera } = {}) {
		this.objects = new Set();
		
		this.lightSources = new DirectionalLight({ 
            fov: 90,
            position: new Vec(0, 0, -8000),
			rotation: new Vec(20, 20, 0),
		});
		
		this.activeCamera = camera;

		this.grid = new Grid(100, 20);

		this.curosr = new Cursor();
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
		this.activeCamera.update();

		for(let obj of this.objects) {
			if(obj.update) {
				obj.update(ms);
			}
		}
	}

}
