import { Material } from "./Material";

export default class PrimitivetMaterial extends Material {

    name = "PRIMITIVE";
    
    diffuseColor = [0.5, 0.5, 0.5];
    transparency = 0.5;

    receiveShadows = false;
    castShadows = false;
    scaleUniform = true;

    selected = false;

}
