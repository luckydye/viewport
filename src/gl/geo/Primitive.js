import { VertexBuffer } from "../graphics/VertexBuffer.js";
import { Geometry } from "../scene/Geometry.js";

export class Primitive extends Geometry {

	get vertecies() {
		const s = 1;
/*
			 /¯¯¯¯¯¯¯¯¯¯¯¯¯¯/│
		   /              /  │
         /    			/	 │
		│¯¯¯¯¯¯¯¯¯¯¯¯¯¯│	 │
		│			   │	 │
		│		 .	   │	 │
		│			   │    /
		│			   │  /
		│______________│/
*/
		return [
			-s, -s, 0,
			s, -s, 0,
			s, s, 0,

			s, s, 0,
			-s, s, 0,
		];
	}

	createBuffer() {
		const vertArray = this.vertecies;
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "LINE_LOOP";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
		]
		return vertxBuffer;
	}

}
