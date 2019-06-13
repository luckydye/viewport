import { Material } from "./Material";
import { Texture } from "./Texture";
import { Resources } from "../Resources";

Resources.add({
    'spec_map': 'textures/Rock_028_ROUGH.jpg',
    'norm_map': 'textures/Rock_028_NORM.jpg',
}, false);

export default class DefaultMaterial extends Material {

    constructor(attributes) {
        super(attributes);

        this.specularMap = new Texture(Resources.get('spec_map'));
        this.normalMap = new Texture(Resources.get('norm_map'));

        this.specular = 3.33;

        this.receiveShadows = true;
        this.castShadows = true;
    }

}
