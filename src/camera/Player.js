import { mat4, vec3 } from "gl-matrix";
import { FirstPersonCamera } from "./FirstPersonCamera";
import { Vec } from "../Math";

export class Player extends FirstPersonCamera {

	velocity = new Vec();

    update(dt = 0) {
		const projMatrix = this.projMatrix;
		const viewMatrix = this.viewMatrix;
		const camera = this;
        
		const ar = this.sensor.width / this.sensor.height;
        mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);
		
		if(this.velocity) {
			this.velocity.y += dt * 0.25;
			this.position.y += this.velocity.y;
		
			if(this.position.y > -300) {
				this.position.y = -300;
				this.velocity.y = 0;
				this.airborn = false;
			} else {
				this.airborn = true;
			}
		}

		// view

		mat4.lookAt(
			viewMatrix, 
			vec3.fromValues(0, 0, 0),
			camera.lookAt, 
			vec3.fromValues(0, 1, 0)
		);

		mat4.rotateX(viewMatrix, viewMatrix, camera.rotation.x);
		mat4.rotateY(viewMatrix, viewMatrix, camera.rotation.y);

		mat4.scale(viewMatrix, viewMatrix, vec3.fromValues(
			camera.scale, 
			camera.scale, 
			camera.scale,
		));

		mat4.translate(viewMatrix, viewMatrix, camera.position);
		mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
	}

}
