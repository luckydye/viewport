import { VertexBuffer } from "../graphics/VertexBuffer.js";
import { Geometry } from "../scene/Geometry.js";
import { Material } from "../graphics/Material.js";

export class Primitive extends Geometry {
	
	/*			   ______________
				 /│             /│
			   /  │           /  │
			 /______________/	 │
			│     │		   │	 │
			│	  │	       │	 │
			│	  │________│_____│
			│	 /		   │    /
			│  /		   │  /
			│/_____________│/
	*/

	get vertecies() {
		const s = 1;
		return [
			// BACK
			-s, s, -s, 0, 0,
			s, s, -s, 0, 0,
			s, -s, -s, 0, 0,
			-s, -s, -s, 0, 0,
			// LEFT
			-s, -s, s, 0, 0,
			-s, s, s, 0, 0,
			-s, s, -s, 0, 0,
			-s, -s, -s, 0, 0,
			// BOTTOM
			s, -s, -s, 0, 0,
			s, -s, s, 0, 0,
			-s, -s, s, 0, 0,
			-s, -s, -s, 0, 0,
			// FRONT
			-s, s, s, 0, 0,
			s, s, s, 0, 0,
			s, -s, s, 0, 0,
			-s, -s, s, 0, 0,
			// RIGHT
			s, -s, s, 0, 0,
			s, s, s, 0, 0,
			s, s, -s, 0, 0,
			s, -s, -s, 0, 0,
			// TOP
			s, s, -s, 0, 0,
			s, s, s, 0, 0,
			-s, s, s, 0, 0,
			-s, s, -s, 0, 0,
		];
	}

	onCreate() {
		this.mat = this.mat || Material.PRIMITIVE;
	}

	createBuffer() {
		const vertArray = this.vertecies;
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "LINES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
		]
		return vertxBuffer;
	}

}
