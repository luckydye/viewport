import { Material } from "./Material";

export default class PrimitivetMaterial extends Material {
    
    constructor() {
        super("PRIMITIVE");

        this.diffuseColor = [1, 1, 1];

        this.receiveShadows = false;
        this.castShadows = false;
    }

}
