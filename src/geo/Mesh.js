import { Geometry } from "../scene/Geometry";

export class Mesh extends Geometry {

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
