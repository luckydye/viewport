import { EntityControler } from "./EntityControler";

export class ViewportController extends EntityControler {

	initMouse() {

		const entity = this.entity;

		entity.oribting = true;

		this.sensivity = 0.0033;

		this.angleY = 0;
		this.angleX = 0.5;
		this.posX = 0;
		this.posY = 0;
		this.distance = -2000;

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
			if (this.moving) {
				this.posX += e.movementX * this.sensivity * 1000;
				this.posY += -e.movementY * this.sensivity * 1000;
			}
			update();
		}

		const update = () => {
			entity.position.z = this.distance;

			entity.position.x = this.posX;
			entity.position.y = this.posY;

			entity.rotation.x = this.angleX;
			entity.rotation.y = this.angleY;
		}

		this.viewport.addEventListener("wheel", wheel);
		this.viewport.addEventListener("contextmenu", e => e.preventDefault());
		this.viewport.addEventListener("mousedown", down);
		window.addEventListener("mousemove", move);
		window.addEventListener("mouseup", up);

		update();
	}

}
