import { Material } from "./Material.js";
import MattShader from '../shader/MattShader.js';

export default class MattMaterial extends Material {

    constructor(args) {
        super(args);
        
        this.index = 2;
        this.shader = MattShader;
        this.diffuseColor = [1, 1, 1, 1];
        this.castShadows = false;
    }

}
