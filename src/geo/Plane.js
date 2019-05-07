import { Geometry } from "../scene/Geometry.js";

export class Plane extends Geometry {

	get vertecies() {
		const s = 1;
		return [
			-s, -s, 0, 	0, 0,	0, 1, 0,
			s, -s, 0, 	1, 0, 	0, 1, 0,
			s, s, 0, 	1, 1,	0, 1, 0,

			s, s, 0, 	1, 1,	0, 1, 0,
			-s, s, 0, 	0, 1, 	0, 1, 0,
			-s, -s, 0, 	0, 0,	0, 1, 0
		]
	}

	onCreate(args) {
		args.drawmoed = "TRIANGLES";
	}
	
}
