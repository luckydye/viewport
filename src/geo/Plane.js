import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../graphics/VertexBuffer.js";

export class Plane extends Geometry {

	createBuffer() {
		const s = 1;
		const vertArray = [
			-s, -s, 0, 	0, 0,
			s, -s, 0, 	1, 0, 
			s, s, 0, 	1, 1,

			s, s, 0, 	1, 1,
			-s, s, 0, 	0, 1, 
			-s, -s, 0, 	0, 0,
		]
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "TRIANGLES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" }
		]
		return vertxBuffer;
	}
	
}
