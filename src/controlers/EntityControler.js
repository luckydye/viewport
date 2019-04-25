export class EntityControler {

	locked = false;

	constructor(entity, viewport) {
		if(!entity) throw "No controllable entity";

		this.entity = entity;
		this.viewport = viewport;

		this.initKeyboard();
		this.initMouse();
	}

	update() {
		// interface update method
	}

	lock() {
		this.locked = true;
	}

	unlock() {
		this.locked = false;
	}

	initKeyboard() {

	}

	initMouse() {

	}
	
	static isMouseButton(e) {
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

}