import { Resources } from '../Resources.js';
import { Shader } from '../renderer/RendererShader.js';

export default class WorldShader extends Shader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return `#version 300 es
            precision mediump float;
            
            in vec2 vTexCoords;
            in vec4 vTexelPos;
            in vec4 vWorldPos;
            in vec3 vNormal;
            
            struct Material {
                sampler2D texture;
                sampler2D specularMap;
                sampler2D normalMap;
                sampler2D displacementMap;
                vec4 diffuseColor;
                float specular;
                float roughness;
                float metallic;
                float transparency;
                float textureScale;
                bool scaleUniform;
                bool selected;
            };
            uniform Material material;
            
            out vec4 oFragColor;

            void main() {
                oFragColor = vec4(normalize(vWorldPos.xyz), 1.0);
            }
        `;
    }

}