import { Shader } from '../renderer/RendererShader.js';
import { Resources } from '../Resources.js';

export default class CompShader extends Shader {

    static vertexSource() {
        return `#version 300 es

        layout(location = 0) in vec3 aPosition;
        layout(location = 1) in vec2 aTexCoords;

        uniform float aspectRatio;

        out vec2 vTexCoords;
        
        void main() {
            gl_Position = vec4(aPosition, 1.0);
            vTexCoords = aTexCoords;
        }`;
    }

    static fragmentSource() {
        return `#version 300 es

        precision mediump float;
        
        in vec2 vTexCoords;
        
        struct SceneProjection {
            mat4 model;
            mat4 view;
            mat4 projection;
        };
        uniform SceneProjection scene;
        
        uniform vec3 cameraPosition;
        
        uniform sampler2D colorBuffer;
        uniform sampler2D lightingBuffer;
        
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

        vec4 Blur(sampler2D image) {
            return blur9(image, vTexCoords, vec2(200.0), vec2(1.0, 0.0));
        }
        
        void main() {
            vec4 color = texture(colorBuffer, vTexCoords);
            oFragColor = vec4(color.rgb, color.a);

            vec4 light = texture(lightingBuffer, vTexCoords);
            oFragColor = light;
        }`;
    }

}