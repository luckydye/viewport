import { EntityControler } from "./EntityControler";

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

export class CameraControler extends EntityControler {

	constructor(entity, viewport) {
		super(entity);

		this.sensivity = 0.25;

		this.initalSettings = {
			pos: [ entity.position.x, entity.position.y, entity.position.z ],
			rot: [ entity.rotation.x, entity.rotation.y, entity.rotation.z ],
		}

		let moving = false;
		let lastEvent = null;

		const down = e => {
			moving = true;
			entity.update();
		}

		const up = e => {
			moving = false;
			viewport.style.cursor = "default";
			lastEvent = null;
			entity.update();
		}

		const move = e => {
			if(moving && lastEvent) {
				if(isMouseButton(e) == 2 || e.touches && e.touches.length > 1) {
					entity.position.x += (e.x - lastEvent.x) * Math.abs(entity.position.z / 250) * this.sensivity;
					entity.position.y += (e.y - lastEvent.y) * -Math.abs(entity.position.z / 250) * this.sensivity;
					viewport.style.cursor = "move";
				} else if(isMouseButton(e) == 1 || e.type == "touchmove") {
					entity.rotation.y += (e.x - lastEvent.x) * this.sensivity;
					entity.rotation.x += (e.y - lastEvent.y) * this.sensivity;
					viewport.style.cursor = "grabbing";
				}
				entity.update();
			}
			lastEvent = e;
		}

        viewport.addEventListener('contextmenu', e => e.preventDefault());
		viewport.addEventListener("mousedown", down);
		window.addEventListener("mouseup", up);
		window.addEventListener("mousemove", move);

		window.addEventListener("keydown", e => {
			if(e.key == "f") {
				entity.position.x = this.initalSettings.pos[0];
				entity.position.y = this.initalSettings.pos[1];
				entity.position.z = this.initalSettings.pos[2];
				
				entity.rotation.x = this.initalSettings.rot[0];
				entity.rotation.y = this.initalSettings.rot[1];
				entity.rotation.z = this.initalSettings.rot[2];
			}
		});

		viewport.addEventListener("touchstart", down);
		window.addEventListener("touchend", up);
		window.addEventListener("touchmove", e => {
			e.x = e.touches[0].clientX;
			e.y = e.touches[0].clientY;
			move(e);
		});

		viewport.addEventListener("wheel", e => {
			this.zoom(e.deltaY);
			entity.update();
		})
	}

	zoom(dir) {
		const camera = this.entity;
		camera.position.z += -200 * Math.sign(dir);
	}

}