import { EntityControler } from "./EntityControler.js";

export class ViewportController extends EntityControler {

	initMouse() {

		const entity = this.entity;

		this.sensivity = 0.0033;

		entity.position.x = 0;
		entity.position.y = 0;
		entity.position.z = 0;

		this.angleY = 35 / 180 * Math.PI;
		this.angleX = 0.5;
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
			const dir = Math.sign(e.deltaY);
			this.distance -= 1 * dir;
			update();
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
			update();
		}

		const update = () => {
			entity.rotation.y = this.angleY;
			entity.rotation.x = this.angleX;
			entity.origin.z = this.distance;
		}

		this.viewport.addEventListener("wheel", wheel);
		this.viewport.addEventListener("contextmenu", e => e.preventDefault());
		this.viewport.addEventListener("mousedown", down);

		window.addEventListener("mousemove", move);
		window.addEventListener("mouseup", up);

		update();
	}

}
