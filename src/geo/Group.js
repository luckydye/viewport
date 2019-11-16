import { Geometry } from "../scene/Geometry.js";

export class Group extends Geometry {

	get vertecies() {
		const vertArray = [];
		for (let obj of this.objects) {
			vertArray.push(...obj.createBuffer().vertecies);
		}
		return vertArray;
	}

	get indecies() {
		const indexArray = [];
		let offset = 0;
		for (let obj of this.objects) {
			const buffer = obj.createBuffer();
			const indecies = buffer.indecies.map(i => {
				return i + offset;
			});
			indexArray.push(...indecies);

			offset = buffer.vertecies.length / buffer.vertsPerElement;
		}
		return indexArray;
	}

	onCreate(args) {
		args.objects = args.objects || [];
		this.objects = args.objects;
		this.name = "Group";
	}

	add(geo) {
		this.objects.push(geo);
	}

}
