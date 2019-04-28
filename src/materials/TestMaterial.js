import { Resources } from "../Resources";
import { Material } from "./Material";
import { Texture } from "./Texture";

Resources.add({
    'texture256': require('../../res/textures/placeholder_256.png'),
}, false);

export default class TestMaterial extends Material {

    texture = new Texture(Resources.get('texture256'));

    textureScale = 256 * 2;
    diffuseColor = [1, 1, 1];
    
    receiveShadows = true;
    castShadows = true;

}
