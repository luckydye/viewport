export class EntityControler {

	constructor(entity) {
		if(!entity) throw "No controllable entity";

		this.entity = entity;
	}

	update() {
		// interface update method
	}

}