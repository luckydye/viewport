import { Material } from "./Material";

export default class PrimitivetMaterial extends Material {

    constructor(args) {
        super(args);

        this.diffuseColor = [1, 1, 1];
        this.transparency = 0.5;
        
        this.scaleUniform = true;
        
        this.receiveShadows = false;
        this.castShadows = false;
        
        this.selected = false;
    }
}
