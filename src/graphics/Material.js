import { Texture } from "./Texture.js";

export class Material {

    static create(name) {
        Material[name] = new Material();
        Material[name].name = name;
        return Material[name];
    }

    constructor() {
        this.texture = new Texture();
        this.reflectionMap = new Texture();
        this.displacementMap = new Texture();
        
        this.diffuseColor = [1, 1, 1];
        this.transparency = 0;
        this.reflection = 0;
        
        this.receiveShadows = true;
        this.castShadows = true;
    }

}
