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
        
        uniform sampler2D colorBuffer;
        uniform sampler2D worldBuffer;
        uniform sampler2D depthBuffer;
        uniform sampler2D shadowBuffer;

        uniform mat4 shadowProjViewMat;
        
        out vec4 oFragColor;

        vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
            vec4 color = vec4(0.0);
            vec2 off1 = vec2(1.3846153846) * direction;
            vec2 off2 = vec2(3.2307692308) * direction;
            color += texture(image, uv) * 0.2270270270;
            color += texture(image, uv + (off1 / resolution)) * 0.3162162162;
            color += texture(image, uv - (off1 / resolution)) * 0.3162162162;
            color += texture(image, uv + (off2 / resolution)) * 0.0702702703;
            color += texture(image, uv - (off2 / resolution)) * 0.0702702703;
            return color;
        }

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
            vec4 color = texture(colorBuffer, vTexCoords);
            oFragColor = vec4(color.rgb, color.a);

            // if(vTexCoords.x * 4.0 > 3.0 && vTexCoords.y * 4.0 > 3.0) {
            //     float depth = pow(texture(shadowBuffer, vTexCoords * 4.0).r, 10000.0);
            //     oFragColor = vec4(depth);

            // } else {
            //     vec4 world = texture(worldBuffer, vTexCoords);
            //     vec4 projection = vShadowCoords * world * shadowProjViewMat;
            //     vec4 shadow = Shadow(shadowBuffer, projection);

            //     oFragColor *= shadow;
            // }
        }`;
    }

}