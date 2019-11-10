import { Material } from "./Material.js";

export default class DefaultMaterial extends Material {

    constructor(args) {
        super(args);

        this.index = 1;
    }

}
