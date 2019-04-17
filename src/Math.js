import { mat4, vec4 } from "gl-matrix";

export class Vec extends Array {

	static avg(vec1, vec2) {
		return new Vec(
			(vec2[0] + vec1[0]) / 2,
			(vec2[1] + vec1[1]) / 2,
			(vec2[2] + vec1[2]) / 2,
		);
	}

	static add(vec1, vec2) {
		return new Vec(
			vec1[0] + vec2[0],
			vec1[1] + vec2[1],
			vec1[2] + vec2[2],
			vec1[3] + vec2[3]
		);
	}

	static multiply(vec1, vec2) {
		return new Vec(
			vec1[0] * vec2[0],
			vec1[1] * vec2[1],
			vec1[2] * vec2[2],
			vec1[3] * vec2[3],
		);
	}

	get x() { return this[0]; }
	get y() { return this[1]; }
	get z() { return this[2]; }
	get w() { return this[3]; }

	set x(val) { this[0] = val; }
	set y(val) { this[1] = val; }
	set z(val) { this[2] = val; }
	set w(val) { this[3] = val; }

	constructor(x = 0, y = 0, z = 0, w = 0) {
		super();

		this[0] = x;
		this[1] = y;
		this[2] = z;
		this[3] = w;

		if(arguments.length === 1) {
			this[0] = x[0];
			this[1] = x[1];
			this[2] = x[2];
			this[3] = x[3];
		}
	}

	add(vec) {
		return Vec.add(this, vec);
	}

	multiply(vec) {
		return Vec.multiply(this, vec);
	} 
}

export class Ray extends Vec {

	setPosition(vx, vy, vwidth, vheight) {
		this[0] = (2 * vx) / vwidth - 1;
		this[1] = 1 - (2 * vy) / vheight;
		this[2] = -1;
		this[3] = 1;
	}

	cast(projMatrix) {
		// ec4 ray_eye = inverse(projection_matrix) * ray_clip;
		// ray_eye = vec4(ray_eye.xy, -1.0, 0.0);
		const projInverse = mat4.create();
		mat4.invert(projInverse, projMatrix);
		vec4.transformMat4(this, this, projInverse);
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