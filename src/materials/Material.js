import { Texture } from "./Texture";

export class Material {

    static applyAttributes(material, attributes) {
        return Object.assign(material, attributes);
    }

    constructor(attributes = {}) {

        this.texture = Texture.EMPTY;
        this.specularMap = Texture.EMPTY;
        this.displacementMap = Texture.EMPTY;
        this.normalMap = Texture.EMPTY;
        
        this.diffuseColor = [1, 1, 1, 1];
        this.transparency = 0;
        this.specular = 1;
        this.roughness = 1;
        this.metallic = 0;
        
        this.textureScale = 1;
        
        this.receiveShadows = true;
        this.castShadows = true;
        
        this.scaleUniform = false;

        for(let attrb in attributes) {
            this[attrb] = attributes[attrb];
        }
    }

}
