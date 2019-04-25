import { Material } from "./Material";

export default class LightMaterial extends Material {

    name = "LIGHT";
    
    constructor() {
        super();

        this.receiveShadows = false;
        this.castShadows = false;
    }

}
