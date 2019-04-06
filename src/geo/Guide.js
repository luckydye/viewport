import { Geometry } from "../scene/Geometry";
import { VertexBuffer } from "../scene/VertexBuffer";

export class Guide extends Geometry {

	onCreate(args) {
		const s = args.scale;
		const { x, y, z } = args.origin;
		this.points = [
			x, y, z + s,	1, 1,	0,0,0,
			x, y, z + -s,	0, 0,	0,0,0,
			x, y + s, z,	1, 0,	0,0,0,
			x, y -s, z,		0, 0,	0,0,0,
			x + s, y, z,	0, 0,	0,0,0,
			x -s, y, z,		0, 0,	0,0,0
		];
	}
    
	createBuffer() {
		const vertxBuffer = VertexBuffer.create(this.points);
		vertxBuffer.type = "LINES";
		return vertxBuffer;
	}

}
