import { Resources } from "../Resources";
import { Material } from "./Material";
import { Texture } from "./Texture";

Resources.add({
    'texture256': require('../../res/textures/placeholder_256.png'),
}, false);

export default class TestMaterial extends Material {
    
    name = "TEST";

    constructor() {
        super();

        this.texture = new Texture(Resources.get('texture256'));

        this.textureScale = 256;
        this.diffuseColor = [1, 1, 1];

        this.receiveShadows = true;
        this.castShadows = true;
    }

}
