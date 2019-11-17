import { Geometry } from "../scene/Geometry.js";

export class Group extends Geometry {

	get vertecies() {
		const vertArray = [];
		const materials = new Set();
		
		for (let obj of this.objects) {
			const verts = obj.createBuffer().vertecies;
			
			materials.add(obj.material);
			const matIndex = [...materials].indexOf(obj.material);

			const scale = Array.isArray(obj.scale) ? obj.scale : [obj.scale, obj.scale, obj.scale];
			
			for(let vert = 0; vert < verts.length; vert += 9) {
				vertArray.push(
					verts[vert + 0] * obj.scale[0] + obj.position.x,
					verts[vert + 1] * obj.scale[1] + obj.position.y,
					verts[vert + 2] * obj.scale[2] + obj.position.z,
	
					verts[vert + 3],
					verts[vert + 4],
					matIndex,
	
					verts[vert + 6],
					verts[vert + 7],
					verts[vert + 8],
				);
			}
		}

		this.materials.push(...materials);

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
		this.materials = [];
	}

	add(geo) {
		this.objects.push(geo);
	}

}
