import DefaultMaterial from "../materials/DefaultMaterial";
import { Sphere } from "../geo/Sphere";

export class Pointlight extends Sphere {
	
	get isLight() {
		return true;
	}

	onCreate(args) {
		super.onCreate(args);

		const {
			intensity = 2.0,
			color = [1, 1, 1],
			size = 10,
		} = args;
		
		this.intensity = intensity;
		this.color = color;
		this.size = size;
		this.scale = 20;

		args.material = new DefaultMaterial();
		args.material.diffuseColor = this.color;
		args.material.specular = 0;
	}

}