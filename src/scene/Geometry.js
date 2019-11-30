import { Transform, uuidv4, Vec } from "../Math.js";
import DefaultMaterial from "../materials/DefaultMaterial.js";
import { mat4, glMatrix, quat, vec3 } from 'gl-matrix';

// performance option, use Array instad of Float32Arrays
glMatrix.setMatrixArrayType(Array);

export class Geometry extends Transform {

	static get attributes() {
		return [
			{ size: 3, attribute: "aPosition" },
			{ size: 3, attribute: "aTexCoords" },
			{ size: 3, attribute: "aNormal" },
		]
	}

	get vertecies() {
		return this.vertArray || [];
	}

	get indecies() {
		return this.indexArray || [];
	}

    get material() {
        return this.materials[0];
    }

    set material(mat) {
        this.materials[0] = mat;
    }

	constructor(args = {}) {
		super(args);

		this.name = "Geometry";

		this.instanced = false;
		this.instances = 0;

		this.uid = uuidv4();

		this.onCreate(args);

		const {
			indecies = null,
			vertecies = null,
			material = null,
			materials = null,
			hidden = false,
			selectable = true,
			guide = false,
			hitbox = null,
			parent = null,
			uv = [0, 0],
		} = args;

        this.materials = materials || [];

		if(material) {
			this.materials.push(material);
		}

		this.parent = parent;

		this.matrixAutoUpdate = false;
		this.lastUpdate = 1;

		this.hitbox = hitbox;

		this.indexArray = indecies;
		this.vertArray = vertecies;
		this.hidden = hidden;
		this.selectable = selectable;
		this.guide = guide;
		this.uv = uv;
		this.modelMatrix = mat4.create();
	}

	updateModel() {
		this.updateModelMatrix();
		this.lastUpdate = Date.now();
	}

	getGlobalPosition() {
		return this.parent ? vec3.add([], this.position, this.parent.getGlobalPosition()) : this.position;
	}

	getGlobalRotation() {
		return this.parent ? vec3.add([], this.rotation, this.parent.getGlobalRotation()) : this.rotation;
	}
	
	getState() {
		return (
			this.parent ? this.parent.state : 0
		) + (
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
		) + (
			this.scale
		) + this.lastUpdate;
	}

	updateVertexBuffer() {
		this.uid = Date.now() + Math.random();
	}

	updateModelMatrix() {
		const state = this.getState();

		if(state != this.state) {
			this.state = state;
		} else {
			return;
		}

		const rotQuat = quat.create();

		const position = this.getGlobalPosition();
		const rotation = this.getGlobalRotation();
		const scale = Array.isArray(this.scale) ? this.scale : [this.scale, this.scale, this.scale];

		quat.fromEuler(rotQuat, 
			rotation[0] * ( 180 / Math.PI ),
			rotation[1] * ( 180 / Math.PI ),
			rotation[2] * ( 180 / Math.PI ),
		);

		mat4.fromRotationTranslationScaleOrigin(
			this.modelMatrix,
			rotQuat,
			position,
			scale,
			this.origin
		);

		mat4.translate(this.modelMatrix, this.modelMatrix, this.origin);
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
		return this.attributeElements;
	}

	constructor(vertArray, indexArray, attributes) {

		this.vertecies = new Float32Array(vertArray);
		this.indecies = new Uint16Array(indexArray);

		this.attributes = attributes;

		this.attributeElements = 0;

		for (let key in this.attributes) {
			this.attributeElements += this.attributes[key].size;
		}
	}

}
