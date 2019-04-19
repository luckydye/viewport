import { Geometry } from "../scene/Geometry";

export class Group extends Geometry {

	get vertecies() {
		const vertArray = [];
		for(let obj of this.objects) {
			vertArray.push(...obj.buffer.vertecies);
		}
		return vertArray;
	}

	get indecies() {
		const indexArray = [];
		let offset = 0;
		for(let obj of this.objects) {
			const indecies = obj.buffer.indecies.map(i => {
				return i + offset;
			});
			indexArray.push(...indecies);

			offset = obj.buffer.vertecies.length / obj.buffer.vertsPerElement;
		}
		return indexArray;
	}
    
    onCreate(args) {
        args.objects = args.objects || [];
		this.objects = args.objects;
    }

    add(geo) {
        this.objects.push(geo);
    }
	
}
