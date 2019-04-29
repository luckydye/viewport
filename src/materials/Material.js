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
    specular = 1;
    roughness = 1;
    metallic = 0;

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
