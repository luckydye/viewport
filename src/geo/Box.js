import { Cube } from "./Cube.js";
import PrimitivetMaterial from '../materials/PrimitiveMaterial.js';
import { Geometry } from '../scene/Geometry.js';

export class Box extends Geometry {

	get vertecies() {
		return [
			[this.left, this.top, this.depth],
			[this.right, this.top, this.depth],
			[this.left, this.bottom, this.depth],
			[this.right, this.bottom, this.depth],

			[this.left, this.top, -this.depth],
			[this.right, this.top, -this.depth],
			[this.left, this.bottom, -this.depth],
			[this.right, this.bottom, -this.depth],
		].map(vert => [...vert,  0, 0, 0,  ...this.color]).flat();
	}

	get indecies() {
		return [
			// clipping off
			// fron
			0, 1, 2,
			1, 3, 2,
			// top
			0, 1, 4,
			0, 1, 5,
			// bottom
			2, 7, 6,
			2, 7, 3,
			// back
			4, 5, 6,
			5, 7, 6,
			// left
			0, 4, 6,
			0, 6, 2,
			// right
			1, 5, 7,
			1, 7, 3,
		]
	}

	constructor(args) {
		super(args);

		this.material = new PrimitivetMaterial();
		this.material.drawmode = "TRIANGLES";

		this.color = [1, 0, 0];

		this.matrixAutoUpdate = true;
	}

	onCreate(args) {
        super.onCreate(args);

		this.name = "Box";
		
		this.depth = args.depth || 1;
        this.top = args.top;
		this.right = args.right;
        this.bottom = args.bottom;
        this.left = args.left;
	}
}
