import { Geometry } from "../scene/Geometry.js";
import { VertexBuffer } from "../graphics/VertexBuffer.js";

export class Group extends Geometry {

	createBuffer() {
		const vertArray = this.build();
		const vertxBuffer = VertexBuffer.create(vertArray);
		vertxBuffer.type = "TRIANGLES";
		vertxBuffer.attributes = [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
			{ size: 3, attribute: "aNormal" },
		]
		return vertxBuffer;
	}
	
	build() {
		const vertArray = [];
		for(let obj of this.objects) {
			vertArray.push(...obj._buffer.vertArray);
		}
		return vertArray;
	}
    
    onCreate(args) {
        args.objects = args.objects || [];
        this.objects = args.objects;
    }

    add(geo) {
        this.objects.push(geo);
    }
	
}
