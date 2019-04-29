import { GLShader } from '../renderer/GLShader';
import { Resources } from '../Resources.js';

export default class PickingShader extends GLShader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return `#version 300 es
        
        precision mediump float;
        
        struct Material {
            vec3 diffuseColor;
            float specular;
            float roughness;
            float metallic;
            float transparency;
            float textureScale;
            bool scaleUniform;
            bool selected;
        };
        uniform Material material;

        in vec3 primitiveColor;
        
        out vec4 oFragColor;
        
        void main () {
            oFragColor = vec4(primitiveColor, .75);

            if(material.selected) {
                oFragColor = oFragColor + vec4(0.33, 0.33, 0.33, 1.0);
            }
        }`;
    }
}
