import { EntityControler } from "./EntityControler.js";

export class CameraControler extends EntityControler {

	initMouse() {

		this.sensivity = 0.0033;
		this.speed = 20;

		const entity = this.entity;

		const down = e => {
			if (EntityControler.isMouseButton(e) == 2) {
				this.unlock();
				this.viewport.requestPointerLock();
			}
		}

		const move = e => {
			if (document.pointerLockElement != null) {
				entity.rotation.y += e.movementX * this.sensivity;
				entity.rotation.x += e.movementY * this.sensivity;

				entity.rotation.x = entity.rotation.x % (Math.PI * 2);
				entity.rotation.y = entity.rotation.y % (Math.PI * 2);

				entity.rotation.x = Math.max(Math.min(entity.rotation.x, 1.5), -1.5);
			}
		}

		this.viewport.addEventListener("mousedown", down);
		this.viewport.addEventListener("mousemove", move);
	}

	up() {
		const camera = this.entity;
		camera.position.y -= this.speed * 2;
	}

	down() {
		const camera = this.entity;
		camera.position.y += this.speed * 2;
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

	update() {
		if (this.checkKey("w")) this.move(1);
		if (this.checkKey("s")) this.move(-1);

		if (this.checkKey("a")) this.strafe(1);
		if (this.checkKey("d")) this.strafe(-1);

		if (this.checkKey("q")) this.up();
		if (this.checkKey("y")) this.down();
	}

	lock() {
		super.lock();
		document.exitPointerLock();
	}

}
