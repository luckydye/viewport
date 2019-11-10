import { Material } from "./Material.js";
import PrimitiveShader from '../shader/PrimitiveShader.js';

export default class PrimitivetMaterial extends Material {

    constructor(args) {
        super(args);

        this.index = 3;

        this.shader = PrimitiveShader;

        this.diffuseColor = [1, 1, 1, 1];
        this.transparency = 0.5;

        this.castShadows = false;
    }
}
