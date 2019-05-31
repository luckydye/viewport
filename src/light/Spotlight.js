import { mat4, vec3 } from 'gl-matrix';
import { Camera } from '../scene/Camera';

export class Spotlight extends Camera {
	
	get isLight() {
		return true;
	}

	// update(dt) {
	// 	super.update(dt);

	// 	const ar = this.sensor.width / this.sensor.height;
	// 	mat4.perspective(this.projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);
	// 	mat4.lookAt(
	// 		this.viewMatrix, 
	// 		vec3.fromValues(0, 0, 0),
	// 		vec3.fromValues(camera.lookAt.x, camera.lookAt.y, camera.lookAt.z), 
	// 		vec3.fromValues(0, 1, 0)
	// 	);

	// 	mat4.scale(this.viewMatrix, this.viewMatrix, vec3.fromValues(
	// 		camera.scale, 
	// 		camera.scale, 
	// 		camera.scale,
	// 	));

	// 	mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(
	// 		camera.position.x,
	// 		camera.position.y,
	// 		camera.position.z,
	// 	));

	// 	mat4.rotateX(this.viewMatrix, this.viewMatrix, camera.rotation.x);
	// 	mat4.rotateY(this.viewMatrix, this.viewMatrix, camera.rotation.y);
	// 	mat4.rotateY(this.viewMatrix, this.viewMatrix, camera.rotation.z);
		
	// 	mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
	// }

}
