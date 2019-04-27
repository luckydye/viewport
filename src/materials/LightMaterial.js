import { Material } from "./Material";

export default class LightMaterial extends Material {

    name = "LIGHT";

    receiveShadows = false;
    castShadows = false;
}
