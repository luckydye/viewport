import { EntityControler } from "./EntityControler.js";

export class ViewportController extends EntityControler {

	initMouse() {

		const entity = this.entity;

		this.sensivity = 0.0033;

		entity.position.x = 0;
		entity.position.y = 0;
		entity.position.z = 0;

		this.angleY = 0;
		this.angleX = 0.7;
		this.distance = -5;

		const down = e => {
			if (this.locked) return;

			if (e.buttons === 1) {
				this.rotating = true;
			} else if (e.buttons === 2) {
				this.moving = true;
			}
		}

		const up = e => {
			this.rotating = false;
			this.moving = false;
		}

		const wheel = e => {
			if (this.locked) return;
			this.distance -= 1 * Math.sign(e.deltaY);
			updateDistance();
		}

		const move = e => {
			if (this.rotating) {
				this.angleY += e.movementX * this.sensivity;
				this.angleX += e.movementY * this.sensivity;
			}
			if(this.moving) {
				entity.position.y -= (e.movementY * -this.distance * 0.3) * this.sensivity * 2;
				entity.position.x += (e.movementX * -this.distance * 0.3) * this.sensivity * Math.cos(entity.rotation.y) * 2;
				entity.position.z += (e.movementX * -this.distance * 0.3) * this.sensivity * Math.sin(entity.rotation.y) * 2;
			}
			if(this.moving || this.rotating) {
				update();
			}
		}

		const update = () => {
			entity.rotation.y = this.angleY;
			entity.rotation.x = this.angleX;
		}

		let lastAnimationTick = 0;
		let targetDelta = 0;

		const updateDistance = (ts = 0) => {
			if(ts == 0) {
				ts = performance.now();
				lastAnimationTick = ts;
			}

			const targetDelta = -entity.origin.z + this.distance;
			const delta = (ts - lastAnimationTick) * 0.01;

			if(Math.sqrt(Math.pow(entity.origin.z - (entity.origin.z + targetDelta), 2)) > 0.1) {
				entity.origin.z += targetDelta * delta;
				
				lastAnimationTick = ts;
				requestAnimationFrame(updateDistance);
			}
		}

		this.viewport.canvas.addEventListener("wheel", wheel);
		this.viewport.canvas.addEventListener("contextmenu", e => e.preventDefault());
		this.viewport.canvas.addEventListener("mousedown", down);

		window.addEventListener("mousemove", move);
		window.addEventListener("mouseup", up);

		updateDistance();
		update();
	}

}
