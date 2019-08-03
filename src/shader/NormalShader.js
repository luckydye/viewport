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

            struct SceneProjection {
                mat4 model;
                mat4 view;
                mat4 projection;
            };
            in SceneProjection sceneProjection;

            in vec3 vNormal;
            in vec2 vTexCoords;
            
            out vec4 oFragColor;
            
            void main() {
                vec2 mapSize = vec2(textureSize(material.normalMap, 0));
                vec4 map = texture(material.normalMap, vTexCoords);

                vec4 normal = vec4(vNormal, 1.0);
                if(mapSize.x > 0.0) {
                    // normal = map;
                }
                oFragColor = vec4(normal.xyz, 1.0);
            }
        `;
    }

}