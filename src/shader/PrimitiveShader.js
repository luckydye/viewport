import { GLShader } from './GLShader.js';

export default class PrimitiveShader extends GLShader {

    static get source() {
        return [
            `#version 300 es

                layout(location = 0) in vec3 aPosition;
                layout(location = 1) in vec3 aColor;
                
                uniform mat4 uModelMatrix;
                uniform mat4 uViewMatrix;
                uniform mat4 uProjMatrix;
                uniform bool scaleUniform;
                
                out vec3 vColor;
                
                void main () {
                    float distance = 1.0;

                    if(scaleUniform) {
                        distance = (uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0)).z;
                    }

                    gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aPosition * distance, 1.0);

                    vColor = aColor;
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
