import { Cube } from "./Cube.js";
import PrimitivetMaterial from '../materials/PrimitiveMaterial.js';

export class Box extends Cube {

	get vertecies() {
		return [
			this.top, this.left, 0, 	0, 0, 0,	1, 0, 0, 
			this.top, this.right, 0, 	0, 0, 0, 	1, 0, 0, 
			this.bottom, this.left, 0, 	0, 0, 0,	1, 0, 0, 
			this.bottom, this.right, 0, 	0, 0, 0,	1, 0, 0, 
		]
	}

	get indecies() {
		return [
			0, 1, 2,
			0, 2, 3
		]
	}

	constructor(args) {
		super(args);

		this.material = new PrimitivetMaterial();
	}

	onCreate(args) {
        super.onCreate(args);

        this.name = "Box";

        this.top = args.top || 1;
        this.bottom = args.bottom || -1;
        this.left = args.left || 1;
		this.right = args.right || -1;
	}
}
