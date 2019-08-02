import { Material } from "./Material";
import { Texture } from "./Texture";
import { Resources } from "../Resources";

export default class DefaultMaterial extends Material {

    constructor(attributes) {
        super(attributes);

        this.specular = 1;

        this.receiveShadows = true;
        this.castShadows = true;
    }

}
