import { Geometry } from "../scene/Geometry.js";

export class Plane extends Geometry {

	static get attributes() {
		return [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" }
		]
	}

	get vertecies() {
		const s = 1;
		const vertArray = [
			-s, -s, 0, 	0, 0,
			s, -s, 0, 	1, 0, 
			s, s, 0, 	1, 1,

			s, s, 0, 	1, 1,
			-s, s, 0, 	0, 1, 
			-s, -s, 0, 	0, 0,
		]
		return vertArray;
	}

	onCreate(args) {
		args.drawmoed = "TRIANGLES";
	}
	
}
