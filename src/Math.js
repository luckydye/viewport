export class Vec {

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

	get 0() { return this.x; }
	get 1() { return this.y; }
	get 2() { return this.z; }

	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;

		if(Array.isArray(x)) {
			this.x = x[0];
			this.y = x[1];
			this.z = x[2];
		} else if(x.x) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
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
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
		this.origin = origin;
	}
}