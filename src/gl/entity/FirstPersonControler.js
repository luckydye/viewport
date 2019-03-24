import { EntityController } from "./EntityController.js";

function isMouseButton(e) {
	let mbutton;
	if(e.button != null) {
		if(e.buttons == 4) {
			mbutton = 2;
		} else {
			mbutton = e.buttons;
		}
	} else {
		mbutton = e.which;
	}
	return mbutton;
}

export class FirstPersonControler extends EntityController {

	static get sensivity() {
		return 100;
	}

	constructor(entity, viewport) {
		super(entity);
		
		this.viewport = viewport;

		entity.update = () => {
			this.updateCamera();
		};

		this.initalSettings = {
			pos: [ entity.position.x, entity.position.y, entity.position.z ],
			rot: [ entity.rotation.x, entity.rotation.y, entity.rotation.z ],
		}

		this.initMouse();
		this.initKeyboard();
	}

	initMouse() {
		const entity = this.entity;

		let lastEvent = null;

		const down = e => {
			this.moving = true;
		}

		const up = e => {
			this.moving = false;
			this.viewport.style.cursor = "default";
			lastEvent = null;
		}

		const move = e => {
			if(this.moving && lastEvent) {
				if(isMouseButton(e) == 1 || e.type == "touchmove") {
					entity.rotation.y += (e.x - lastEvent.x) / window.innerWidth * this.constructor.sensivity;
					entity.rotation.x += (e.y - lastEvent.y) / window.innerWidth * this.constructor.sensivity;
					this.viewport.style.cursor = "grabbing";
				}
			}
			lastEvent = e;
		}

		this.viewport.addEventListener("mousedown", down);
		window.addEventListener("mouseup", up);
		window.addEventListener("mousemove", move);
	}

	initKeyboard() {
		this.keyMap = new Map();

		window.addEventListener('keydown', e => {
			this.keyMap.set(e.key, true);
		})
		
		window.addEventListener('keyup', e => {
			this.keyMap.delete(e.key);
		})
	}

	checkKey(key) {
		return this.keyMap.has(key);
	}

	updateCamera() {
		if (this.moving === false && 
			this.keyMap.size < 1 && 
			!this.moving) return;

		const camera = this.entity;
		const moveDir = [0, 0];

		// moveDir[1] = this.checkKey("s") ? -1 : moveDir[1];
		// moveDir[1] = this.checkKey("w") ? 1 : moveDir[1];

		moveDir[0] = this.checkKey("a") ? 1 : moveDir[0];
		moveDir[0] = this.checkKey("d") ? -1 : moveDir[0];

		const projMatrix = camera.projMatrix;
		const viewMatrix = camera.viewMatrix;

		const ar = camera.sensor.width / camera.sensor.height;
		mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);
		mat4.lookAt(
			viewMatrix, 
			vec3.fromValues(0, 0, 0),
			vec3.fromValues(camera.lookAt.x, camera.lookAt.y, camera.lookAt.z), 
			vec3.fromValues(0, 1, 0)
		);

		mat4.scale(viewMatrix, viewMatrix, vec3.fromValues(
			camera.scale, 
			camera.scale, 
			camera.scale,
		));

		const viewDir = Math.PI / 180 * camera.rotation.y;

		camera.position.z += moveDir[1] * 10;
		camera.position.x += moveDir[0] * 10;

		mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(
			camera.position.x,
			-camera.position.y,
			camera.position.z,
		));
		
		mat4.multiply(camera.projViewMatrix, camera.projMatrix, camera.viewMatrix);
	}

}