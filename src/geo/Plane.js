import { Geometry } from "../scene/Geometry.js";

export class Plane extends Geometry {

	get vertecies() {
		const w = this.width || 1;
		const h = this.height || 1;

		return [
			-w, -h, 0, 	0, 0, 0,	0, 0, 1,
			w, -h, 0, 	10, 0, 0, 	0, 0, 1,
			w, h, 0, 	10, 10, 0,	0, 0, 1,

			w, h, 0, 	10, 10, 0,	0, 0, 1,
			-w, h, 0, 	0, 10, 0, 	0, 0, 1,
			-w, -h, 0, 	0, 0, 0,	0, 0, 1
		]
	}

	onCreate(args) {
		args.drawmoed = "TRIANGLES";

		this.name = "Plane";
		this.width = args.width;
		this.height = args.height;
	}
	
}
