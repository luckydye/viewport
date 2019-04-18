import { Geometry } from "../scene/Geometry";

export class Cube extends Geometry {

	onCreate(args) {
		this.vertsPerFace = 6;
		this.visible = {
			TOP: true,
			BOTTOM: true,
			LEFT: true,
			RIGHT: true,
			FRONT: true,
			BACK: true,
		}
	}

	get invisible() {
		return  !this.visible.TOP && 
				!this.visible.BOTTOM &&
				!this.visible.LEFT &&
				!this.visible.RIGHT &&
				!this.visible.FRONT &&
				!this.visible.BACK;
	}

	get vertecies() {
		let vertArray = [];
		const faces = this.faces;

		let visibleFaces = [];

		for(let key in this.visible) {
			if(this.visible[key]) {
				visibleFaces.push(key);
			}
		}

		visibleFaces.forEach(face => {
			vertArray = vertArray.concat(faces[face]);
		})

		return vertArray;
	}

	get faces() {
		const s = 1;
		const w = 10;
		const h = 10;

		const u = this.uv[0];
		const v = this.uv[1];

		const x = 0;
		const y = 0;
		const z = 0;

		return {
			TOP: [
				s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	0, 1, 0,
				s * w + x, s * w + y, -s * h + z, 	1 + u, 0 + v,	0, 1, 0,
				-s * w + x, s * w + y, -s * h + z, 	0 + u, 0 + v,	0, 1, 0,

				s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	0, 1, 0,
				-s * w + x, s * w + y, -s * h + z, 	0 + u, 0 + v,	0, 1, 0,
				-s * w + x, s * w + y, s * h + z, 	0 + u, 1 + v,	0, 1, 0,
			],
			BOTTOM: [
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,	0, -1, 0,
				s * w + x, -s * w + y, -s * h + z, 	1 + u, 0 + v,	0, -1, 0,
				s * w + x, -s * w + y, s * h + z, 	1 + u, 1 + v,	0, -1, 0,

				-s * w + x, -s * w + y, s * h + z, 	0 + u, 1 + v,	0, -1, 0,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,	0, -1, 0,
				s * w + x, -s * w + y, s * h + z, 	1 + u, 1 + v,	0, -1, 0,
			],
			LEFT: [
				-s * w + x, -s * h + y, s * w + z, 	0 + u, 0 + v,	0, 0, 1,
				s * w + x, -s * h + y, s * w + z, 	1 + u, 0 + v,	0, 0, 1,
				s * w + x, s * h + y, s * w + z, 	1 + u, 1 + v,	0, 0, 1,

				-s * w + x, s * h + y, s * w + z, 	0 + u, 1 + v,	0, 0, 1,
				-s * w + x, -s * h + y, s * w + z, 	0 + u, 0 + v,	0, 0, 1,
				s * w + x, s * h + y, s * w + z, 	1 + u, 1 + v,	0, 0, 1,
			],
			RIGHT: [
				s * w + x, s * h + y, -s * w + z, 	1 + u, 1 + v,	0, 0, -1,
				s * w + x, -s * h + y, -s * w + z, 	1 + u, 0 + v,	0, 0, -1,
				-s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v,	0, 0, -1,

				s * w + x, s * h + y, -s * w + z, 	1 + u, 1 + v,	0, 0, -1,
				-s * w + x, -s * h + y, -s * w + z, 0 + u, 0 + v,	0, 0, -1,
				-s * w + x, s * h + y, -s * w + z, 	0 + u, 1 + v,	0, 0, -1,
			],
			FRONT: [
				s * w + x, -s * w + y, -s * h + z, 	0 + u, 0 + v,	1, 0, 0,
				s * w + x, s * w + y, -s * h + z, 	1 + u, 0 + v,	1, 0, 0,
				s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	1, 0, 0,
				
				s * w + x, -s * w + y, s * h + z, 	0 + u, 1 + v,	1, 0, 0,
				s * w + x, -s * w + y, -s * h + z, 	0 + u, 0 + v,	1, 0, 0,
				s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	1, 0, 0,
			],
			BACK: [
				-s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	-1, 0, 0,
				-s * w + x, s * w + y, -s * h + z, 	1 + u, 0 + v,	-1, 0, 0,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,	-1, 0, 0,

				-s * w + x, s * w + y, s * h + z, 	1 + u, 1 + v,	-1, 0, 0,
				-s * w + x, -s * w + y, -s * h + z, 0 + u, 0 + v,	-1, 0, 0,
				-s * w + x, -s * w + y, s * h + z, 	0 + u, 1 + v,	-1, 0, 0,
			]
		}
	}
}
