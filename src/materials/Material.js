import { Texture } from "./Texture";

export class Material {

    constructor(name) {
        this.name = name;

        this.texture = new Texture();
        this.reflectionMap = new Texture();
        this.displacementMap = new Texture();
        
        this.diffuseColor = [1, 1, 1];
        this.transparency = 0;
        this.reflection = 0;

        this.textureScale = 1;
        this.receiveShadows = true;
        this.castShadows = true;
        this.scaleUniform = false;
        
        Material[this.name] = this.constructor;
    }

}
