import { Geometry } from "../scene/Geometry";
import { Vec } from "../Math";
import { VertexBuffer } from "../graphics/VertexBuffer";

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
