import { Resources } from '../Resources.js';
import { GLShader } from '../renderer/GLShader.js';

export default class NormalShader extends GLShader {

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

            in vec3 vNormal;
            
            out vec4 oFragColor;
            
            void main() {
                oFragColor = vec4(vNormal, 1.0);
            }
        `;
    }

}