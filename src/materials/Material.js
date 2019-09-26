import { Texture } from "./Texture.js";
import DefaultShader from '../shader/DefaultShader.js';
import { uuidv4 } from '../Math.js';

export class Material {

    static applyAttributes(material, attributes) {
        return Object.assign(material, attributes);
    }

    get attributes() {
        return {
            texture: this.texture,
            specularMap: this.specularMap,
            displacementMap: this.displacementMap,
            normalMap: this.normalMap,

            diffuseColor: this.diffuseColor,
            transparency: this.transparency,
            specular: this.specular,
            roughness: this.roughness,
            textureScale: this.textureScale,
            scaleUniform: this.scaleUniform,
        };
    }

    constructor(attributes = {}) {
        
		this.uid = uuidv4();

        this.shader = DefaultShader;

        this.texture = Texture.EMPTY;
        this.specularMap = Texture.EMPTY;
        this.displacementMap = Texture.EMPTY;
        this.normalMap = Texture.EMPTY;

        this.diffuseColor = [1, 1, 1, 1];
        this.transparency = 0;
        this.specular = 0.33;
        this.roughness = 0.25;

        this.textureScale = 0;

        this.receiveShadows = true;
        this.castShadows = true;

        this.scaleUniform = false;

        for (let attrb in attributes) {
            this[attrb] = attributes[attrb];
        }
    }

}
