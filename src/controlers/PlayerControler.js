import { Vec } from "../Math.js";
import { CameraControler } from "./CameraControler.js";

export class PlayerControler extends CameraControler {

	constructor(...args) {
		super(...args);

		this.sensivity = 0.0025;
		this.speed = 2;
		this.maxSpeed = 1;
		this.weight = 0.85;
		this.direction = new Vec();
	}

	move(dir) {
		this.direction.z = dir;
	}

	pan(dir) {
		this.direction.y = -dir;
	}

	strafe(dir) {
		this.direction.x = dir;
	}

	update(dt) {
		const entity = this.entity;

		if (this.checkKey("w")) this.move(this.speed);
		if (this.checkKey("s")) this.move(-this.speed);

		if (this.checkKey("a")) this.strafe(this.speed);
		if (this.checkKey("d")) this.strafe(-this.speed);

		if (this.checkKey("q")) this.pan(this.speed);
		if (this.checkKey("y")) this.pan(-this.speed);

		const a = -this.entity.rotation.y;
		const b = -this.entity.rotation.x;

		const camDirectionInv = new Vec(
			Math.sin(-this.entity.rotation.y),
			Math.max(Math.min(Math.tan(this.entity.rotation.x), 1), -1),
			Math.cos(-this.entity.rotation.y),
		)

		const camDirection = new Vec(
			Math.sin(this.entity.rotation.y),
			Math.max(Math.min(Math.tan(this.entity.rotation.x), 1), -1),
			Math.cos(this.entity.rotation.y),
		)

		this.entity.velocity.x += (this.direction.z * camDirectionInv.x) + (this.direction.x * camDirection.z);
		this.entity.velocity.y += (this.direction.z * camDirectionInv.y) + this.direction.y;
		this.entity.velocity.z += (this.direction.z * camDirectionInv.z) + (this.direction.x * camDirection.x);

		this.entity.position.x += this.entity.velocity.x;
		this.entity.position.y += this.entity.velocity.y;
		this.entity.position.z += this.entity.velocity.z;

		let resistance = this.weight;

		this.entity.velocity.x *= resistance;
		this.entity.velocity.y *= resistance;
		this.entity.velocity.z *= resistance;

		this.direction.x = 0;
		this.direction.y = 0;
		this.direction.z = 0;
	}

}
