import { GLShader } from './GLShader.js';

export default class FinalShader extends GLShader {

    static get source() {
        return [
            `#version 300 es

                layout(location = 0) in vec3 aPosition;
                layout(location = 1) in vec2 aTexCoords;

                uniform float aspectRatio;

                out vec2 texCoords;
                
                void main() {
                    gl_Position = vec4(aPosition, 1.0);
                    texCoords = aTexCoords;
                }
            `,

            `#version 300 es
            precision mediump float;
            
            in vec2 texCoords;
            
            uniform sampler2D depthBuffer;
            uniform sampler2D diffuseBuffer;
            uniform sampler2D lightBuffer;
            uniform sampler2D reflectionBuffer;
            uniform sampler2D guidesBuffer;
            
            uniform bool fog;
            
            out vec4 oFragColor;
            
            void main(void) {
                float depth = texture(depthBuffer, texCoords).r;
                vec4 color = texture(diffuseBuffer, texCoords);
                vec4 light = texture(lightBuffer, texCoords);
                vec4 reflection = texture(reflectionBuffer, texCoords);
                vec4 guides = texture(guidesBuffer, texCoords);
            
                if(color.a > 0.0) {
                    oFragColor = color;
                }
                
                if(color.a > 0.0 && light.a > 0.0) {
                    oFragColor *= light;
                }
            
                if(color.a == 0.0) {
                    oFragColor = vec4(reflection.rgb * vec3(0.4, 0.4, 0.5) + vec3(0.1, 0.15, 0.8), 1.0);
                    oFragColor *= light;
                }
            
                if(fog && color.a > 0.0) {
                    vec3 fogColor = vec3(0.04);
                    vec3 fogValue = vec3(pow(depth, 150.0)) * fogColor;
                    oFragColor += vec4(fogValue, 1.0) * 2.0;
                }
            
                if(guides.a > 0.0) {
                    oFragColor = guides / oFragColor * vec4(3.0);
                }
            }
            `
        ];
    }

    constructor() {
        super({ name: "final" });
    }

}