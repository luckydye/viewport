import { Shader } from '../renderer/RendererShader.js';
import { Resources } from '../Resources.js';

export default class PostShader extends Shader {

    static vertexSource() {
        return `#version 300 es

        layout(location = 0) in vec3 aPosition;
        layout(location = 1) in vec2 aTexCoords;

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
        
        uniform sampler2D color;
        uniform sampler2D comp;

        out vec4 oFragColor;
        
        vec4 blur9(sampler2D image, vec2 uv, vec2 direction) {

            vec2 resolution = vec2(1280.0);

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

        float luminance(vec3 color) {
            vec3 wheights = vec3(0.299, 0.587, 0.114);
            return dot(wheights, color);
        }

        void Bloom() {

            float threshold = 0.8;

            float size = 0.002;

            vec4 color1 = texture(color, vec2(vTexCoords.x + size, vTexCoords.y));
            vec4 color2 = texture(color, vec2(vTexCoords.x, vTexCoords.y + size));
            vec4 color3 = texture(color, vec2(vTexCoords.x, vTexCoords.y - size));
            vec4 color4 = texture(color, vec2(vTexCoords.x - size, vTexCoords.y));

            float luma = (
                luminance(color1.rgb) +
                luminance(color2.rgb) +
                luminance(color3.rgb) +
                luminance(color4.rgb)
            ) / 4.0;

            oFragColor.rgb += vec3(step(threshold, luma));
        }

        void Blur() {

            float weight[5] = float[5](0.2270270270, 0.1945945946, 0.1216216216,
                                        0.0540540541, 0.0162162162);

            float offset[5] = float[5](0.0, 1.0, 2.0, 3.0, 4.0);
            
            vec2 coord = vTexCoords * vec2(1024.0);

            vec4 fragColor = texture(color, vec2(coord) / 1024.0) * weight[0];

            for (int i=1; i < 5; i++) {
                fragColor += texture(color, (vec2(coord) + vec2(0.0, offset[i])) / 1024.0) * weight[i];
                fragColor += texture(color, (vec2(coord) - vec2(0.0, offset[i])) / 1024.0) * weight[i];
            }

            oFragColor = fragColor;
        }

        void main() {
            vec4 finalColor = texture(comp, vTexCoords);
            oFragColor = vec4(1.0);
        }`;
    }

}