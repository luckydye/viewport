import { Material } from "./Material";
import PrimitiveShader from '../shader/PrimitiveShader';

export default class PrimitivetMaterial extends Material {

    constructor(args) {
        super(args);

        this.shader = new PrimitiveShader();

        this.diffuseColor = [1, 1, 1, 1];
        this.transparency = 0.5;

        this.receiveShadows = false;
        this.castShadows = false;
    }
}
