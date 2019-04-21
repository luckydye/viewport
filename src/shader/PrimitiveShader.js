import { GLShader } from './GLShader.js';

export default class PickingShader extends GLShader {

    static get source() {
        return [
            `#version 300 es

            layout(std140, column_major) uniform;
            
            layout(location = 0) in vec3 aPosition;
            layout(location = 1) in vec2 aTexCoords;
            layout(location = 2) in vec3 aNormal;
            
            uniform bool scaleUniform;
            uniform mat4 uModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjMatrix;
            
            uniform sampler2D displacementMap;
            
            out vec3 vColor;
            
            void main() {
                vec4 bump = texture(displacementMap, aTexCoords); // idfk

                float distance = 1.0;
                if(scaleUniform) {
                    distance = (uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0)).z;
                }
            
                gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition * distance, 1.0);
            
                vColor = aNormal;
            }
            `,
            
            `#version 300 es
            precision mediump float;
            
            in vec3 vColor;
            
            out vec4 oFragColor;
            
            void main () {
                oFragColor = vec4(vColor, .75);
            }
            `,
        ];
    }
    
    constructor() {
        super({ name: "primitive" });
    }
}
