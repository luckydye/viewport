import { Camera } from '../camera/Camera';
import { Grid } from '../geo/Grid.js';
import { DirectionalLight } from '../light/DirectionalLight';
import { Vec } from '../Math.js';
import { Tool } from '../geo/Tool';

let lastTick = 0;

export class Scene {

	constructor({ camera } = {}) {
		this.objects = new Set();
		
		this.lightSources = new DirectionalLight({ 
            fov: 90,
            position: new Vec(0, 0, -8000),
			rotation: new Vec(20, 20, 0),
		});
		
		this.activeCamera = camera || new Camera({
			fov: 90,
			position: new Vec(0, 500, 0)
		});

		this.grid = new Grid(100, 20);

		this.curosr = new Tool({
			origin: new Vec()
		});
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

	update() {
		const time = performance.now();
		
		this.activeCamera.update();
		lastTick = time;
		
		this.onupdate && this.onupdate();
	}

}
