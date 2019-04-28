import { Texture } from "./Texture";

export class Material {

    static applyAttributes(material, attributes) {
        return Object.assign(material, attributes);
    }

    texture = new Texture();
    reflectionMap = new Texture();
    displacementMap = new Texture();
    
    diffuseColor = [1, 1, 1];
    transparency = 0;
    reflection = 0;
    specular = 0.25;
    roughness = 32;

    textureScale = 1;

    receiveShadows = true;
    castShadows = true;
    
    scaleUniform = false;

    constructor(attributes = {}) {
        for(let attrb in attributes) {
            this[attrb] = attributes[attrb];
        }
    }

}
