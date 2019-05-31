import { Material } from "./Material";

export default class PrimitivetMaterial extends Material {

    diffuseColor = [1, 1, 1];
    transparency = 0.5;
    
    scaleUniform = true;

    receiveShadows = false;
    castShadows = false;

    selected = false;
}
