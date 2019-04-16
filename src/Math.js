export class Vec extends Array {

	static avg(vec1, vec2) {
		return new Vec(
			(vec2.x + vec1.x) / 2,
			(vec2.y + vec1.y) / 2,
			(vec2.z + vec1.z) / 2,
		);
	}

	static add(vec1, vec2) {
		return new Vec(
			vec1.x + vec2.x,
			vec1.y + vec2.y,
			vec1.z + vec2.z
		);
	}

	static multiply(vec1, vec2) {
		return new Vec(
			vec1.x * vec2.x,
			vec1.y * vec2.y,
			vec1.z * vec2.z
		);
	}

	get x() { return this[0]; }
	get y() { return this[1]; }
	get z() { return this[2]; }

	set x(val) { this[0] = val; }
	set y(val) { this[1] = val; }
	set z(val) { this[2] = val; }

	constructor(x = 0, y = 0, z = 0) {
		super();

		this[0] = x;
		this[1] = y;
		this[2] = z;

		if(arguments.length === 1) {
			this[0] = x[0];
			this[1] = x[1];
			this[2] = x[2];
		}
	}

	add(vec) {
		return Vec.add(this, vec);
	}

	multiply(vec) {
		return Vec.multiply(this, vec);
	} 
}

export class Transform {
	constructor({
		position = new Vec(),
		rotation = new Vec(),
		origin = new Vec(),
		scale = 1,
	} = {}) {
		this.position = new Vec(position);
		this.rotation = new Vec(rotation);
		this.scale = scale;
		this.origin = new Vec(origin);
	}
}