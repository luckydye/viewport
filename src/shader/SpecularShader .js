import { Resources } from '../Resources.js';
import { GLShader } from '../renderer/GLShader.js';

export default class SpecularShader extends GLShader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return `#version 300 es
            precision mediump float;
            
            struct Material {
                sampler2D texture;
                sampler2D specularMap;
                sampler2D normalMap;
                sampler2D displacementMap;
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

            in vec2 vTexCoords;
            
            out vec4 oFragColor;
            
            void main() {
                vec4 map = texture(material.specularMap, vTexCoords);
                oFragColor = map;
            }
        `;
    }

}