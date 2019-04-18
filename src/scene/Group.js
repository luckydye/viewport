import { Geometry } from "./Geometry";

export class Group extends Geometry {

	get vertecies() {
		return this.build();
	}

	build() {
		const vertArray = [];
		for(let obj of this.objects) {
			vertArray.push(...obj._buffer.vertecies);
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
