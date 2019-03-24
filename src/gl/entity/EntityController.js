export class EntityController {

	static get sensivity() {
		return 200;
	}

	constructor(entity) {
		if(!entity) throw "No controllable entity";

		this.entity = entity;
	}

	update() {
		// interface update method
	}

}