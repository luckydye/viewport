import { GLShader } from './GLShader.js';

export default class ReflectionShader extends GLShader {

    static get source() {
        return [
            `#version 300 es

            layout(location = 0) in vec3 aPosition;
            layout(location = 1) in vec2 aTexCoords;
            layout(location = 2) in vec3 aNormal;
            
            struct SceneProjection {
                mat4 model;
                mat4 view;
                mat4 projection;
            };
            
            uniform SceneProjection scene;
            
            out vec2 vTexCoords;
            out vec4 vWorldPos;
            out vec3 vNormal;
            
            void main() {
                vec4 pos = scene.model * vec4(aPosition, 1.0);
                pos.y *= -1.0;
                pos.y += 42.0;
            
                vWorldPos = pos;
                vNormal = aNormal;
                vTexCoords = aTexCoords;
            
                gl_Position = scene.projection * scene.view * vec4(pos.xyz, 1.0);
                gl_PointSize = 5.0;
            }
            `,

            `#version 300 es
            precision mediump float;

            in vec2 vTexCoords;
            in vec3 vNormal;

            uniform sampler2D colorTexture;
            uniform sampler2D reflectionMap;

            uniform float textureScale;
            uniform float transparency;
            uniform vec3 diffuseColor;

            out vec4 oFragColor;

            void main() {
                // set diffuse color
                oFragColor = vec4(diffuseColor, 1.0 - transparency);

                vec2 imageSize = vec2(textureSize(colorTexture, 0));
                if(imageSize.x > 1.0) {
                    vec2 textureCoords = vec2(vTexCoords) / (imageSize.x / textureScale);

                    vec4 textureColor = texture(colorTexture, textureCoords);
                    oFragColor *= textureColor;

                    float reflectivenss = texture(reflectionMap, textureCoords).r;
                    if(reflectivenss > 0.0) {
                        discard;
                    }
                }
            }
            `,
        ]
    }
    
    constructor() {
        super({ name: "reflection" });
    }

}