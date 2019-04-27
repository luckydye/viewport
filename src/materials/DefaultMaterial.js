import { Material } from "./Material";

export default class DefaultMaterial extends Material {

    name = "DEFAULT";

    receiveShadows = true;
    castShadows = true;

}
