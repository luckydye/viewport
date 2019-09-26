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

	static blur9() {
		return `
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
		`;
	}

    static fragmentSource() {
        return `#version 300 es

        precision mediump float;
        
        in vec2 vTexCoords;
        
        uniform vec3 cameraPosition;
        
        uniform sampler2D color;
        uniform sampler2D depth;
        uniform sampler2D lighting;
        uniform sampler2D shadow;
        uniform sampler2D guides;
        uniform sampler2D guidesDepth;
        
        out vec4 oFragColor;

        void main() {
            vec4 color = texture(color, vTexCoords);
            vec4 light = texture(lighting, vTexCoords);
            vec4 depth = texture(depth, vTexCoords);
            vec4 guides = texture(guides, vTexCoords);
            vec4 guidesDepth = texture(guidesDepth, vTexCoords);

            if(light.a > 0.0) {
                color.rgb *= light.rgb;
            }

            if(guidesDepth.r < depth.r) {
                color += (guides * 0.6);
            }

            oFragColor = color;
        }`;
    }

}