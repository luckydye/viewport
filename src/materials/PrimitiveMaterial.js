import { Material } from "./Material";

export default class PrimitivetMaterial extends Material {

    diffuseColor = [0.5, 0.5, 0.5];
    transparency = 0.5;
    
    scaleUniform = true;

    receiveShadows = false;
    castShadows = false;

    selected = false;
}
