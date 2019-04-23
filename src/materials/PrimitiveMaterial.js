import { Material } from "./Material";

export default class PrimitivetMaterial extends Material {

    _name = "PRIMITIVE";
    
    constructor() {
        super();

        this.receiveShadows = false;
        this.castShadows = false;
        this.scaleUniform = true;
    }

}
