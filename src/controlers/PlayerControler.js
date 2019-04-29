import { Vec } from "../Math";
import { CameraControler } from "./CameraControler";

export class PlayerControler extends CameraControler {

	sensivity = 0.0025;
	speed = 5;

	direction = new Vec();

	jump() {
		if(!this.entity.airborn) {
			this.entity.velocity.y -= 40;
		}
		this.entity.airborn = true;
	}

	move(dir) {
		this.direction.x = dir;
		let speed = this.speed * this.direction.x;

		if(this.entity.airborn) {
			speed *= 0.2;
		}
		
		const camera = this.entity;
		const a = -camera.rotation.y;

		this.entity.velocity.x += speed * Math.sin(a);
		this.entity.velocity.z += speed * Math.cos(a);
	}

	strafe(dir) {
		this.direction.z = dir;
		let speed = this.speed * this.direction.z;

		if(this.entity.airborn) {
			speed *= 0.2;
		}

		const camera = this.entity;
		const a = camera.rotation.y;

		this.entity.velocity.x += speed * Math.cos(a);
		this.entity.velocity.z += speed * Math.sin(a);
	}

	update(dt) {
		const entity = this.entity;

		if(entity.velocity) {
			entity.velocity.y += dt * 0.25;
			entity.position.y += entity.velocity.y;
		
			if(entity.position.y > -entity.height) {
				entity.position.y = -entity.height;
				entity.velocity.y = 0;
				entity.airborn = false;
			}
		}
		
		if(this.checkKey("w")) this.move(1);
		if(this.checkKey("s")) this.move(-1);

		if(this.checkKey("a")) this.strafe(1);
		if(this.checkKey("d")) this.strafe(-1);

		if(this.checkKey(" ")) this.jump();

		if(this.checkKey("Control")) {
			this.entity.height = 200;
			this.speed = 2;
		} else {
			this.entity.height = 300;
			this.speed = 5;
		}

		this.entity.position.x += this.entity.velocity.x;
		this.entity.position.z += this.entity.velocity.z;

		let resistance = 0.8;

		if(this.entity.airborn) {
			resistance = 0.94;
		}

		this.entity.velocity.x *= resistance;
		this.entity.velocity.z *= resistance;

		this.direction.x = 0;
		this.direction.y = 0;
		this.direction.z = 0;
	}

}
