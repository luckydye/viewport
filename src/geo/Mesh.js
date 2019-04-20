import { Geometry } from "../scene/Geometry";

export class Mesh extends Geometry {

    static get attributes() {
        return [
			{ size: 3, attribute: "aPosition" },
			{ size: 2, attribute: "aTexCoords" },
		]
    }

	get vertecies() {
        return this.meshVertecies;
	}

	get indecies() {
		return this.meshIndecies;
	}

	get uvs() {
		return this.meshUVs;
	}
    
    onCreate(args) {
        this.meshIndecies = args.indecies || [];
        this.meshVertecies = args.vertecies || [];
        this.meshNormals = args.normals || [];
        this.meshUVs = args.uvs || [];
    }
	
}
