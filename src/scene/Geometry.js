import { Transform, uuidv4, Vec } from "../Math.js";
import DefaultMaterial from "../materials/DefaultMaterial.js";
import { mat4, glMatrix, quat } from 'gl-matrix';

// performance option, use Array instad of Float32Arrays
glMatrix.setMatrixArrayType(Array);

export class Geometry extends Transform {

	static get attributes() {
		return [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
			{ size: 3, attribute: "aNormal" },
		]
	}

	get vertecies() {
		return this.vertArray || [];
	}

	get indecies() {
		return [];
	}

	constructor(args = {}) {
		super(args);

		this.instanced = false;
		this.instances = 0;

		this.uid = uuidv4();

		this.onCreate(args);

		const {
			vertecies = null,
			material = null,
			hidden = false,
			guide = false,
			uv = [0, 0],
		} = args;

		this.vertArray = vertecies;
		this.material = material;
		this.hidden = hidden;
		this.guide = guide;
		this.uv = uv;
		this.modelMatrix = mat4.create();
	}

	getState() {
		return (
			this.position[0] +
			this.position[1] +
			this.position[2]
		) + (
			this.rotation[0] +
			this.rotation[1] +
			this.rotation[2]
		) + (
			this.origin[0] +
			this.origin[1] +
			this.origin[2]
		) + this.scale;
	}

	updateModelMatrix() {
		const state = this.getState();

		if(state != this.cache) {
			const rotQuat = quat.create();

			quat.fromEuler(rotQuat, 
				this.rotation.x * ( 180 / Math.PI ),
				this.rotation.y * ( 180 / Math.PI ),
				this.rotation.z * ( 180 / Math.PI ),
			);

			mat4.fromRotationTranslationScaleOrigin(
				this.modelMatrix,
				rotQuat,
				this.position,
				[this.scale, this.scale, this.scale],
				this.origin
			);

			mat4.translate(this.modelMatrix, this.modelMatrix, this.origin);
		}

		this.cache = state;
	}

	onCreate(args) {

	}

	createBuffer() {
		return new VertexBuffer(
			this.vertecies,
			this.indecies,
			this.constructor.attributes
		);
	}
}

class VertexBuffer {

	get vertsPerElement() {
		return this.vertecies.length / this.elements;
	}

	get elements() {
		let count = 0;
		for (let key in this.attributes) {
			count += this.attributes[key].size;
		}
		return count;
	}

	constructor(vertArray, indexArray, attributes) {

		this.vertecies = new Float32Array(vertArray);
		this.indecies = new Uint16Array(indexArray);

		this.attributes = attributes;
	}

}
