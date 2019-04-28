import { FirstPersonControler } from "./FirstPersonControler";

export class PlayerControler extends FirstPersonControler {
	
	jump() {
		if(!this.entity.airborn) {
			this.entity.velocity.y -= 50;
		}

		console.log(this.entity.velocity.y);
	}

	checkControls() {
		if(this.checkKey("w")) this.move(1);
		if(this.checkKey("s")) this.move(-1);

		if(this.checkKey("a")) this.strafe(1);
		if(this.checkKey("d")) this.strafe(-1);

		if(this.checkKey(" ")) this.jump();
	}

	sensivity = 0.0033;
	speed = 20;

}
