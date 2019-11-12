import { Texture } from "./Texture.js";
import DefaultShader from '../shader/DefaultShader.js';
import { uuidv4 } from '../Math.js';

export class Material {

    static applyAttributes(material, attributes) {
        return Object.assign(material, attributes);
    }

    get attributes() {
        return {
            diffuseColor: this.diffuseColor,
            transparency: this.transparency,
            specular: this.specular,
            roughness: this.roughness,
            textureScale: this.textureScale,
        };
    }

    constructor(attributes = {}) {
        
        this.uid = uuidv4();
        
        this.index = 0;

        this.shader = DefaultShader;

        this.texture = null;
        this.specularMap = null;
        this.displacementMap = null;
        this.normalMap = null;

        this.diffuseColor = [1, 1, 1, 1];
        this.transparency = 0;
        this.specular = 0.33;
        this.roughness = 0.25;

        this.textureScale = 0;

        this.castShadows = true;

        this.scaleUniform = false;

        this.customUniforms = {};

        for (let attrb in attributes) {
            this[attrb] = attributes[attrb];
        }
    }

}
