export class EntityControler {

	constructor(entity) {
		if(!entity) throw "No controllable entity";

		this.locked = false;
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