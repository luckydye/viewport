import { mat4, vec3 } from 'gl-matrix';
import { Camera } from "../camera/Camera";

export class DirectionalLight extends Camera {
	
	get isLight() { return true; }

	update() {
		const projMatrix = this.projMatrix;
		const viewMatrix = this.viewMatrix;
		const camera = this;

		const ar = this.sensor.width / this.sensor.height;
		mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);
		mat4.lookAt(
			viewMatrix, 
			vec3.fromValues(0, 0, 0),
			vec3.fromValues(camera.lookAt.x, camera.lookAt.y, camera.lookAt.z), 
			vec3.fromValues(0, 1, 0)
		);

		mat4.scale(viewMatrix, viewMatrix, vec3.fromValues(
			camera.scale, 
			camera.scale, 
			camera.scale,
		));

		mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(
			camera.position.x,
			camera.position.y,
			camera.position.z,
		));

		mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 180 * camera.rotation.x);
		mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 180 * camera.rotation.y);
		
		mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
	}

}
