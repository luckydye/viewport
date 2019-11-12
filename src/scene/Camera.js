import { mat4, vec3, glMatrix, quat } from 'gl-matrix';
import { Vec } from '../Math.js';
import DefaultMaterial from '../materials/DefaultMaterial.js';
import { Entity } from './Entity.js';
import PrimitivetMaterial from '../materials/PrimitiveMaterial.js';

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
		const s = 1;
		const w = this.sensor.width;
		const vertArray = [
			// farplane
			w, w, -this.farplane, 1, 1, 1, 1, 1,
			-w, w, -this.farplane, 1, 1, 1, 1, 1,

			-w, w, -this.farplane, 1, 1, 1, 1, 1,
			-w, -w, -this.farplane, 1, 1, 1, 1, 1,

			-w, -w, -this.farplane, 1, 1, 1, 1, 1,
			w, -w, -this.farplane, 1, 1, 1, 1, 1,

			w, -w, -this.farplane, 1, 1, 1, 1, 1,
			w, w, -this.farplane, 1, 1, 1, 1, 1,

			// nearplane
			s, s, -this.nearplane, 1, 1, 1, 1, 1,
			-s, s, -this.nearplane, 1, 1, 1, 1, 1,

			-s, s, -this.nearplane, 1, 1, 1, 1, 1,
			-s, -s, -this.nearplane, 1, 1, 1, 1, 1,

			-s, -s, -this.nearplane, 1, 1, 1, 1, 1,
			s, -s, -this.nearplane, 1, 1, 1, 1, 1,

			s, -s, -this.nearplane, 1, 1, 1, 1, 1,
			s, s, -this.nearplane, 1, 1, 1, 1, 1,

			-s, -s, -this.nearplane, 1, 1, 1, 1, 1,
			s, s, -this.nearplane, 1, 1, 1, 1, 1,


			0, 0, -this.nearplane, 0, 0, 1, 0, 0,
			0, 0, -this.farplane, 0, 0, 1, 0, 0,

			-s, -s, -this.nearplane, 0, 0, 1, 1, 1,
			-w, -w, -this.farplane, 0, 0, 1, 1, 1,

			-s, s, -this.nearplane, 0, 0, 1, 1, 1,
			-w, w, -this.farplane, 0, 0, 1, 1, 1,

			s, s, -this.nearplane, 0, 0, 1, 1, 1,
			w, w, -this.farplane, 0, 0, 1, 1, 1,

			s, -s, -this.nearplane, 0, 0, 1, 1, 1,
			w, -w, -this.farplane, 0, 0, 1, 1, 1,
		]
		return vertArray;
	}

	onCreate(args) {
		args.material = new PrimitivetMaterial();
	}

	constructor(args = {}) {
		const {
			fov = 54.4,
			farplane = 2000,
			nearplane = 0.1,
			width = 1280,
			height = 720,
			perspective = Camera.PERSPECTIVE,
		} = args;
		super(args);

		this.hidden = true;

		this.fov = fov;
		this.farplane = farplane;
		this.nearplane = nearplane;
		this.lookAt = new Vec(0, 0, 0);
		this.perspective = perspective;

		this.projMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.projViewMatrix = mat4.create();

		this.sensor = {
			width: width,
			height: height
		}
	}

	updateModelMatrix() {
		const state = this.getState();

		if(state != this.cache) {

			if (this.perspective == Camera.ORTHGRAPHIC) {
				mat4.ortho(
					this.projMatrix, 
					-this.sensor.width, this.sensor.width, 
					-this.sensor.height, this.sensor.height,
					this.nearplane, 
					this.farplane
				);
			}
	
			if (this.perspective == Camera.PERSPECTIVE) {
				const ar = this.sensor.width / this.sensor.height;
				mat4.perspective(this.projMatrix, Math.PI / 180 * this.fov, ar, this.nearplane, this.farplane);
			}

			mat4.identity(this.viewMatrix);
			
			mat4.translate(this.viewMatrix, this.viewMatrix, this.origin);

			mat4.rotateX(this.viewMatrix, this.viewMatrix, this.rotation.x);
			mat4.rotateY(this.viewMatrix, this.viewMatrix, this.rotation.y);
			mat4.rotateZ(this.viewMatrix, this.viewMatrix, this.rotation.z);
			
			mat4.translate(this.viewMatrix, this.viewMatrix, this.position);

			mat4.identity(this.modelMatrix);
			mat4.invert(this.modelMatrix, this.viewMatrix);

			mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
		}

		this.cache = state;
	}

}
