export class Vec {
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

export class Transform {
	constructor({
		position = new Vec(),
		rotation = new Vec(),
		scale = 1,
	} = {}) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
	}
}