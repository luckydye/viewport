import { Resources } from "../Resources";
import { Material } from "./Material";
import { Texture } from "./Texture";

Resources.add({
    'texture256': require('../../res/textures/placeholder_256.png'),
}, false);

export default class TestMaterial extends Material {

    texture = new Texture(Resources.get('texture256'));
    textureScale = 256 * 2;

    specular = 3.33;
    
    specularMap = new Texture(Resources.get('spec_map'));
}
