import { Material } from "./Material";
import { Texture } from "./Texture";
import { Resources } from "../Resources";

Resources.add({
    'spec_map': require('../../res/textures/Rock_028_ROUGH.jpg'),
    'norm_map': require('../../res/textures/Rock_028_NORM.jpg'),
}, false);

export default class DefaultMaterial extends Material {

    receiveShadows = true;
    castShadows = true;

    specular = 3.33;
    
    specularMap = new Texture(Resources.get('spec_map'));
    normalMap = new Texture(Resources.get('norm_map'));
}
