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
            attributes: this.materialAttributes,
        };
    }

    set specular(val) {
        this.materialAttributes[0] = val;
    }

    set roughness(val) {
        this.materialAttributes[1] = val;
    }

    get specular() {
        return this.materialAttributes[0];
    }

    get roughness() {
        return this.materialAttributes[1];
    }

    constructor(attributes = {}) {
        
        this.uid = uuidv4();
        
        this.shader = DefaultShader;

        this.texture = null;
        this.specularMap = null;
        this.displacementMap = null;
        this.normalMap = null;

        this.diffuseColor = [1, 0, 1, 1];
        this.transparency = 0;

        this.materialAttributes = [0.33, 0.33];

        this.castShadows = true;

        for (let attrb in attributes) {
            this[attrb] = attributes[attrb];
        }

        this.lastUpdate = 1;
    }

    update() {
        this.lastUpdate = Date.now();
    }

}
