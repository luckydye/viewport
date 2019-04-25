import { EntityControler } from "./EntityControler";

export class FirstPersonControler extends EntityControler {

	up() {
		const camera = this.entity;
		camera.position.y -= this.speed;
	}

	down() {
		const camera = this.entity;
		camera.position.y += this.speed;
	}

	move(dir) {
		const camera = this.entity;
		const speed = this.speed * dir;
		
		const a = -camera.rotation.y;
		const b = -camera.rotation.x;

		camera.position.x += speed * Math.sin(a);
		camera.position.z += speed * Math.cos(a);
		
		camera.position.y -= speed * Math.sin(b);
	}

	strafe(dir) {
		const camera = this.entity;
		const speed = this.speed * dir;
		
		const a = camera.rotation.y;

		camera.position.z += speed * Math.sin(a);
		camera.position.x += speed * Math.cos(a);
	}

	checkControls() {
		if(this.checkKey("w")) this.move(1);
		if(this.checkKey("s")) this.move(-1);

		if(this.checkKey("a")) this.strafe(1);
		if(this.checkKey("d")) this.strafe(-1);

		if(this.checkKey("q")) this.up();
		if(this.checkKey("y")) this.down();
	}

	sensivity = 0.0033;
	speed = 20;

	constructor(entity, viewport) {
		super(entity, viewport);

		const entityUpdate = entity.update.bind(entity);
		entity.update = (arg) => {
			this.checkControls();
			entityUpdate(arg);
		}
	}

	lock() {
		super.lock();
		document.exitPointerLock();
	}

	initMouse() {
		const entity = this.entity;

		const down = e => {
			if(EntityControler.isMouseButton(e) == 2) {
				this.viewport.requestPointerLock();
			}
		}

		const move = e => {
			if(document.pointerLockElement != null) {
				entity.rotation.y += e.movementX * this.sensivity;
				entity.rotation.x += e.movementY * this.sensivity;

				entity.rotation.x = entity.rotation.x % (Math.PI * 2);
				entity.rotation.y = entity.rotation.y % (Math.PI * 2);
				entity.rotation.z = entity.rotation.z % (Math.PI * 2);

				entity.rotation.x = Math.max(Math.min(entity.rotation.x, 1.5), -1.5);
			}
		}

		this.viewport.addEventListener("mousedown", down);
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
