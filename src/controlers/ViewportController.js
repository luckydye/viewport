import { EntityControler } from "./EntityControler.js";

export class ViewportController extends EntityControler {

	initMouse() {

		const entity = this.entity;

		this.sensivity = 0.0033;

		this.angleY = 1.0;
		this.angleX = 1.0;
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
