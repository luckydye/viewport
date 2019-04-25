export class EntityControler {

	locked = false;

	constructor(entity) {
		if(!entity) throw "No controllable entity";

		this.entity = entity;
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

}