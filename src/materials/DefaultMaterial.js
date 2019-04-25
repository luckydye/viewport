import { Material } from "./Material";

export default class DefaultMaterial extends Material {

    name = "DEFAULT";
    
    constructor() {
        super();

        this.diffuseColor = [1, 1, 1];

        this.receiveShadows = true;
        this.castShadows = true;
    }

}
