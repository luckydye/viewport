import { Material } from "./Material";

export default class PrimitivetMaterial extends Material {
    
    constructor() {
        super("PRIMITIVE");

        this.receiveShadows = false;
        this.castShadows = false;
        this.scaleUniform = true;
    }

}
