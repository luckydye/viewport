import { mat4, vec3 } from 'gl-matrix';
import { Vec } from '../Math.js';
import DefaultMaterial from '../materials/DefaultMaterial.js';
import { Entity } from './Entity.js';

const DEFAULT_CAMERA_MATERIAL = new DefaultMaterial();

export class Camera extends Entity {

	get vertecies() {
		const s = 50 / this.scale;
		const vertArray = [
			-s, -s, 0, 	0, 0,	0,0,0,
			s, -s, 0, 	1, 0, 	0,0,0,
			s, s, 0, 	1, 1,	0,0,0,

			s, s, 0, 	1, 1,	0,0,0,
			-s, s, 0, 	0, 1, 	0,0,0,
			-s, -s, 0, 	0, 0,	0,0,0,

			s, s, 0, 	1, 1,	0,0,0,
			s, s, s * 2, 	1, 1,	0,0,0,

			-s, -s, s * 2, 	0, 0,	0,0,0,
			s, -s, s * 2, 	1, 0, 	0,0,0,
			s, s, s * 2, 	1, 1,	0,0,0,

			s, s, s * 2, 	1, 1,	0,0,0,
			-s, s, s * 2, 	0, 1, 	0,0,0,
			-s, -s, s * 2, 	0, 0,	0,0,0,

			-s/2, -s/2, -s, 	0, 0,	0,0,0,
			s/2, -s/2, -s, 		1, 0, 	0,0,0,
			s/2, s/2, -s, 		1, 1,	0,0,0,

			s/2, s/2, -s, 		1, 1,	0,0,0,
			-s/2, s/2, -s, 		0, 1, 	0,0,0,
			-s/2, -s/2, -s, 	0, 0,	0,0,0,
		]
		return vertArray;
	}

	onCreate(args) {
		args.drawmode = "LINE_STRIP";
		args.material = DEFAULT_CAMERA_MATERIAL;
	}

	constructor(args = {}) {
		const {
			fov = 50,
			scale = 0.004,
			farplane = 350,
			nearplane = 0.025,
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

		this.projMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.projViewMatrix = mat4.create();

		this.sensor = {
			width: width,
			height: height
		}

		const self = this;

		this.worldPosition = {
			get x() {
				return -self.position.x;
			},
			get y() {
				return -self.position.y;
			},
			get z() {
				return -self.position.z;
			}
		}
	}

	update(ms) {
		super.update(ms);

		const projMatrix = this.projMatrix;
		const viewMatrix = this.viewMatrix;
		const camera = this;
        
		const ar = this.sensor.width / this.sensor.height;
		mat4.perspective(projMatrix, Math.PI / 180 * camera.fov, ar, camera.nearplane, camera.farplane);
		
		if(this.oribting) {

			mat4.lookAt(
				viewMatrix, 
				vec3.fromValues(0, 0, 0),
				camera.lookAt, 
				vec3.fromValues(0, 0, 0)
			);
	
			mat4.scale(viewMatrix, viewMatrix, vec3.fromValues(
				camera.scale, 
				camera.scale, 
				camera.scale,
			));
	
			mat4.translate(viewMatrix, viewMatrix, camera.position);
	
			mat4.rotateX(viewMatrix, viewMatrix, camera.rotation.x);
			mat4.rotateY(viewMatrix, viewMatrix, camera.rotation.y);

		} else {
			mat4.lookAt(
				viewMatrix, 
				vec3.fromValues(0, 0, 0),
				camera.lookAt, 
				vec3.fromValues(0, 0, 0)
			);
	
			mat4.rotateX(viewMatrix, viewMatrix, camera.rotation.x);
			mat4.rotateY(viewMatrix, viewMatrix, camera.rotation.y);
	
			mat4.scale(viewMatrix, viewMatrix, vec3.fromValues(
				camera.scale, 
				camera.scale, 
				camera.scale,
			));
	
			mat4.translate(viewMatrix, viewMatrix, camera.position);
		}
		
		mat4.multiply(this.projViewMatrix, this.projMatrix, this.viewMatrix);
	}

}
