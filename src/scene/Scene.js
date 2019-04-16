import { Camera } from '../camera/Camera';
import { Grid } from '../geo/Grid.js';
import { DirectionalLight } from '../light/DirectionalLight';
import { Vec } from '../Math.js';
import { Tool } from '../geo/Tool';
import { Guide } from '../geo/Guide';
import TestMaterial from '../materials/TestMaterial';
import PrimitivetMaterial from '../materials/PrimitiveMaterial';

let lastTick = 0;

export class Scene {

	constructor({ camera } = {}) {
		this.objects = new Set();
		
		this.lightSources = new DirectionalLight({ 
            fov: 90,
            position: new Vec(0, 0, -15000),
			rotation: new Vec(28, 0, 0),
		});
		
		this.activeCamera = camera || new Camera({
			fov: 90,
			position: new Vec(0, 500, 0)
		});

		this.grid = new Grid(160, 16);

		this.curosr = new Tool({
			origin: new Vec()
		});

		this.clear();
	}

	add(obj) {
		this.objects.add(obj);
	}

	clear() {
		this.objects.clear();
	}

	update() {
		const time = performance.now();
		
		this.activeCamera.update();
		if(this.lightSources) {
			this.lightSources.rotation.y += 0.02 * (time - lastTick);
			this.lightSources.update();
		}
		lastTick = time;
		
		this.onupdate && this.onupdate();
	}

}
