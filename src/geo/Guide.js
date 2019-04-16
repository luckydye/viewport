import { VertexBuffer } from "../scene/VertexBuffer";
import PrimitivetMaterial from "../materials/PrimitiveMaterial";
import { Vec } from "../Math";
import { Primitive } from "./Primitive";

const DEFAULT_GUIDE_MATERIAL = new PrimitivetMaterial();

export class Guide extends Primitive {

	onCreate(args) {
		args.guide = true;
		args.material = DEFAULT_GUIDE_MATERIAL;
	}

	get vertecies() {
		const s = this.scale * 10 || 10;
		const { x, y, z } = this.origin || new Vec();

		return [
			x, y, z + s,	1,1,1,
			x, y, z + -s,	1,1,1,
			x, y + s, z,	1,1,1,
			x, y -s, z,		1,1,1,
			x + s, y, z,	1,1,1,
			x -s, y, z,		1,1,1
		];
	}
    
	createBuffer() {
		const vertArray = this.vertecies;
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "LINES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 3, attribute: "aColor" },
		]
		return vertxBuffer;
	}

}
