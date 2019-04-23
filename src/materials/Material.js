import { Texture } from "./Texture";

export class Material {

    _name = "material";

    get name() { return this._name; }

    constructor() {
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
