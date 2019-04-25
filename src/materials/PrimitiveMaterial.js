import { Material } from "./Material";

export default class PrimitivetMaterial extends Material {

    name = "PRIMITIVE";
    
    constructor() {
        super();

        this.diffuseColor = [0.5, 0.5, 0.5];
        this.transparency = 0.5;

        this.receiveShadows = false;
        this.castShadows = false;
        this.scaleUniform = true;

        this.selected = false;
    }

}
