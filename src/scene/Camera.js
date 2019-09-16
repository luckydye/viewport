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
			fov = 50,
			scale = 0.004,
			farplane = 5000,
			nearplane = 0.025,
			width = 1280,
			height = 720,
			oribting = false,
		} = args;
		super(args);

		this.hidden = true;

		this.scale = scale;
		this.fov = fov;
		this.farplane = farplane;
		this.nearplane = nearplane;
		this.lookAt = new Vec(0, 0, 0);
		this.oribting = oribting;
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

		const ar = this.sensor.width / this.sensor.height;

		const position = Vec.add(camera.position, camera.origin);


		mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);

		if (this.perspective == Camera.ORTHGRAPHIC) {
			const sx = Math.tan(camera.fov / 2) * 4;
			const sy = Math.tan(camera.fov / 2) * 4;
			// mat4.ortho(projMatrix, -sx, sx, -sy, sy, ar, camera.nearplane, camera.farplane);
		}

		if (this.oribting) {

			mat4.scale(viewMatrix, viewMatrix, [
				camera.scale,
				camera.scale,
				camera.scale,
			]);

			mat4.rotateX(viewMatrix, viewMatrix, camera.rotation.x);
			mat4.rotateY(viewMatrix, viewMatrix, camera.rotation.y);
			mat4.rotateZ(viewMatrix, viewMatrix, camera.rotation.z);

			mat4.translate(viewMatrix, viewMatrix, position);

			mat4.lookAt(
				viewMatrix,
				camera.position,
				camera.lookAt,
				[0, 1, 0]
			);

		} else {
			mat4.scale(viewMatrix, viewMatrix, [
				camera.scale,
				camera.scale,
				camera.scale,
			]);

			mat4.lookAt(
				viewMatrix,
				[0, 0, 0],
				camera.lookAt,
				[0, 1, 0]
			);

			mat4.rotateX(viewMatrix, viewMatrix, camera.rotation.x);
			mat4.rotateY(viewMatrix, viewMatrix, camera.rotation.y);
			mat4.rotateZ(viewMatrix, viewMatrix, camera.rotation.z);

			mat4.translate(viewMatrix, viewMatrix, position);
		}

		mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
	}

}
