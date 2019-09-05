import { EntityControler } from "./EntityControler.js";

export class ViewportController extends EntityControler {

	initMouse() {

		const entity = this.entity;

		entity.oribting = true;

		this.sensivity = 0.0033;

		this.angleY = 0;
		this.angleX = Math.PI * 180;
		this.distance = -1500;

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
			this.distance -= 100 * dir;
			update();
		}

		const move = e => {
			if (this.rotating) {
				this.angleY += e.movementX * this.sensivity;
				this.angleX += e.movementY * this.sensivity;

				this.angleX = Math.max(Math.min(this.angleX, Math.PI), 0);
			}
			update();
		}

		const update = () => {
			entity.position.x = Math.sin(-this.angleY) * this.distance;
			entity.position.y = Math.min(Math.cos(-this.angleX), Math.PI) * this.distance;
			entity.position.z = Math.cos(-this.angleY) * this.distance;
		}

		this.viewport.addEventListener("wheel", wheel);
		this.viewport.addEventListener("contextmenu", e => e.preventDefault());
		this.viewport.addEventListener("mousedown", down);

		window.addEventListener("mousemove", move);
		window.addEventListener("mouseup", up);

		update();
	}

}
