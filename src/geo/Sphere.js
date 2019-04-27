import { Geometry } from "../scene/Geometry.js";
import { Resources } from "../Resources.js";
import { Loader } from "../Loader.js";

Resources.add({
    'sphere_model': require('../../res/models/sphere.obj'),
}, false);

export class Sphere extends Geometry {

    get vertecies() {
		return Loader.loadObjFile(Resources.get('sphere_model'));
	}
	
}
