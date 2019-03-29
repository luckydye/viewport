export class Vec {

	get 0() { return this.x; }
	get 1() { return this.y; }
	get 2() { return this.z; }

	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	add(vec) {
		return new Vec(
			this.x + vec.x,
			this.y + vec.y,
			this.z + vec.z
		);
	}

	multiply(vec) {
		return new Vec(
			this.x * vec.x,
			this.y * vec.y,
			this.z * vec.z
		);
	} 
}

export class Transform {
	constructor({
		position = new Vec(),
		rotation = new Vec(),
		origin = new Vec(),
		scale = 1,
	} = {}) {
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.origin = origin;
	}
}