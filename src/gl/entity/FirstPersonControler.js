import { EntityController } from "@uncut/viewport/src/gl/entity/EntityController";

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

	move(dir) {
		const camera = this.entity;
		const speed = 10 * dir;
		
		const a = -camera.rotation.y;
		const b = -camera.rotation.x;

		camera.position.x += speed * Math.sin(a);
		camera.position.z += speed * Math.cos(a);
		
		camera.position.y -= speed * Math.sin(b);
	}

	strafe(dir) {
		const camera = this.entity;
		const speed = 10 * dir;
		
		const a = camera.rotation.y;

		camera.position.z += speed * Math.sin(a);
		camera.position.x += speed * Math.cos(a);
	}

	constructor(entity, viewport) {
		super(entity);

		const entityUpdate = entity.update.bind(entity);
		entity.update = (arg) => {

			if(this.checkKey("w")) this.move(1);
			if(this.checkKey("s")) this.move(-1);

			if(this.checkKey("a")) this.strafe(1);
			if(this.checkKey("d")) this.strafe(-1);

			entityUpdate(arg);
		}
		
		this.viewport = viewport;

		this.initMouse();
		this.initKeyboard();

		this.sensivity = 0.0033;
	}

	initMouse() {
		const entity = this.entity;

		const down = e => {
			this.moving = true;
			this.viewport.requestPointerLock();
		}

		const up = e => {
			this.moving = false;
			this.viewport.style.cursor = "default";
			document.exitPointerLock();
		}

		const move = e => {
			if(this.moving) {
				if(isMouseButton(e) == 1 || e.type == "touchmove") {
					entity.rotation.y += e.movementX * this.sensivity;
					entity.rotation.x += e.movementY * this.sensivity;

					entity.rotation.x = entity.rotation.x % (Math.PI * 2);
					entity.rotation.y = entity.rotation.y % (Math.PI * 2);
					entity.rotation.z = entity.rotation.z % (Math.PI * 2);

					entity.rotation.x = Math.max(Math.min(entity.rotation.x, 1.5), -1.5);

					this.viewport.style.cursor = "grabbing";
				}
			}
		}

		this.viewport.addEventListener("mousedown", down);
		window.addEventListener("mouseup", up);
		this.viewport.addEventListener("mousemove", move);
	}

	initKeyboard() {
		this.keyMap = new Map();

		window.addEventListener('keydown', e => {
			if(document.pointerLockElement != null) {
				this.keyMap.set(e.key, true);
			}
		})
		
		window.addEventListener('keyup', e => {
			this.keyMap.delete(e.key);
		})
	}

	checkKey(key) {
		return this.keyMap.has(key);
	}

}
