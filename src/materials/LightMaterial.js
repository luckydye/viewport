import { Material } from "./Material";

export default class LightMaterial extends Material {
    
    constructor() {
        super("LIGHT");

        this.receiveShadows = false;
        this.castShadows = false;
    }

}
