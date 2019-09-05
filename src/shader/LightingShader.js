import MeshShader from './MeshShader.js';

export default class LightShader extends MeshShader {

    static fragmentSource() {
        return `#version 300 es
            precision mediump float;
        
            struct Material {
                sampler2D texture;
                sampler2D specularMap;
                sampler2D normalMap;
                sampler2D displacementMap;
                sampler2D roughnessMap;
                vec4 diffuseColor;
                float specular;
                float roughness;
                float transparency;
                float textureScale;
                bool scaleUniform;
            };
    
            uniform Material material;
            
            in vec2 vTexCoords;
            in vec4 vTexelPos;
            in vec3 vNormal;
            
            out vec4 oFragColor;

            void main() {
                oFragColor = texture(material.specularMap, vTexCoords);
            }
        `;
    }

}