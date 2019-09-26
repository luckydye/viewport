import { mat4, vec3, glMatrix } from 'gl-matrix';
import { Vec } from '../Math.js';
import DefaultMaterial from '../materials/DefaultMaterial.js';
import { Entity } from './Entity.js';

// performance option, use Array instad of Float32Arrays
glMatrix.setMatrixArrayType(Array);

export class Camera extends Entity {

	static get ORTHGRAPHIC() {
		return "orthographic";
	}

	static get PERSPECTIVE() {
		return "perspective";
	}

	get vertecies() {
		const s = 50 / this.scale;
		const vertArray = [
			-s, -s, 0, 0, 0, 0, 0, 0,
			s, -s, 0, 1, 0, 0, 0, 0,
			s, s, 0, 1, 1, 0, 0, 0,

			s, s, 0, 1, 1, 0, 0, 0,
			-s, s, 0, 0, 1, 0, 0, 0,
			-s, -s, 0, 0, 0, 0, 0, 0,

			s, s, 0, 1, 1, 0, 0, 0,
			s, s, s * 2, 1, 1, 0, 0, 0,

			-s, -s, s * 2, 0, 0, 0, 0, 0,
			s, -s, s * 2, 1, 0, 0, 0, 0,
			s, s, s * 2, 1, 1, 0, 0, 0,

			s, s, s * 2, 1, 1, 0, 0, 0,
			-s, s, s * 2, 0, 1, 0, 0, 0,
			-s, -s, s * 2, 0, 0, 0, 0, 0,

			-s / 2, -s / 2, -s, 0, 0, 0, 0, 0,
			s / 2, -s / 2, -s, 1, 0, 0, 0, 0,
			s / 2, s / 2, -s, 1, 1, 0, 0, 0,

			s / 2, s / 2, -s, 1, 1, 0, 0, 0,
			-s / 2, s / 2, -s, 0, 1, 0, 0, 0,
			-s / 2, -s / 2, -s, 0, 0, 0, 0, 0,
		]
		return vertArray;
	}

	onCreate(args) {
		args.material = new DefaultMaterial();
	}

	get worldPosition() {
		return new Vec(
			-this.position.x,
			-this.position.y,
			-this.position.z,
		);
	}

	constructor(args = {}) {
		const {
			fov = 75,
			scale = 0.004,
			farplane = 7000,
			nearplane = 0.01,
			width = 1280,
			height = 720,
		} = args;
		super(args);

		this.hidden = true;

		this.scale = scale;
		this.fov = fov;
		this.farplane = farplane;
		this.nearplane = nearplane;
		this.lookAt = new Vec(0, 0, 0);
		this.perspective = Camera.PERSPECTIVE;

		this.projMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.projViewMatrix = mat4.create();

		this.sensor = {
			width: width,
			height: height
		}
	}

	update(ms) {
		super.update(ms);

		const projMatrix = this.projMatrix;
		const viewMatrix = this.viewMatrix;
		const camera = this;

		if (this.perspective == Camera.ORTHGRAPHIC) {
			mat4.ortho(
				projMatrix, 
				-this.sensor.width * 4, this.sensor.width * 4, 
				-this.sensor.height * 4, this.sensor.height * 4,
				camera.nearplane, 
				camera.farplane
			);
		}

		if (this.perspective == Camera.PERSPECTIVE) {
			const ar = this.sensor.width / this.sensor.height;
			mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);
		}

		mat4.lookAt(
			viewMatrix,
			[0, 0, 0],
			camera.lookAt,
			[0, 1, 0]
		);

		mat4.translate(viewMatrix, viewMatrix, camera.origin);

		mat4.rotateX(viewMatrix, viewMatrix, camera.rotation.x);
		mat4.rotateY(viewMatrix, viewMatrix, camera.rotation.y);
		mat4.rotateZ(viewMatrix, viewMatrix, camera.rotation.z);

		mat4.translate(viewMatrix, viewMatrix, camera.position);

		mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
	}

}
