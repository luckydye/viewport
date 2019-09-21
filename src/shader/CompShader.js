import { Shader } from '../renderer/RendererShader.js';
import { Resources } from '../Resources.js';

export default class CompShader extends Shader {

    static vertexSource() {
        return `#version 300 es

        layout(location = 0) in vec3 aPosition;
        layout(location = 1) in vec2 aTexCoords;

        uniform float aspectRatio;

        out vec2 vTexCoords;
        out mat4 vShadowCoords;
        
        const mat4 texUnitConverter = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 
            0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

        void main() {
            gl_Position = vec4(aPosition, 1.0);
            vTexCoords = aTexCoords;
            vShadowCoords = texUnitConverter;
        }`;
    }

    static fragmentSource() {
        return `#version 300 es

        precision mediump float;
        
        in vec2 vTexCoords;
        in mat4 vShadowCoords;
        
        struct SceneProjection {
            mat4 model;
            mat4 view;
            mat4 projection;
        };
        uniform SceneProjection scene;
        
        uniform vec3 cameraPosition;
        
        uniform sampler2D color;
        uniform sampler2D depth;
        uniform sampler2D shadow;

        uniform mat4 shadowProjViewMat;
        
        out vec4 oFragColor;

        ${Shader.blur9()}

        vec4 Bloom(sampler2D image) {
            return blur9(image, vTexCoords, vec2(1024.0), vec2(1.5, 0.0));
        }

        vec4 Shadow(sampler2D shadowMap, vec4 shadowCoord) {

            float distance = normalize(texture(shadowMap, shadowCoord.xy).z);

            float shadow = 1.0;
            if(distance < shadowCoord.z) {
                shadow = 0.5;
            }

            return vec4(shadow);
        }
        
        void main() {
            vec4 color = texture(shadow, vTexCoords);
            oFragColor = vec4(color.rgb, color.a);
        }`;
    }

}