import { GLShader } from "../graphics/GLShader.js";

export default class GridShader extends GLShader {

    static get source() {
        return [
            `#version 300 es

                layout(location = 0) in vec3 aPosition;
                
                uniform mat4 uViewMatrix;
                uniform mat4 uProjMatrix;
                
                out vec4 vPos;
                
                void main () {
                    gl_Position = uProjMatrix * uViewMatrix * vec4(aPosition, 1.0);
                    vPos = vec4(aPosition, 1.0);
                }
            `,
            
            `#version 300 es
                precision mediump float;
                
                in vec4 vPos;
                
                out vec4 oFragColor;
                
                void main () {
                    vec4 color;
                    if(vPos.x == 0.0) {
                        color = vec4(0.33, 0.33, 1.0, 1.0);
                    } else if(vPos.z == 0.0) {
                        color = vec4(1.0, 0.33, 0.33, 1.0);
                    } else {
                        color = vec4(0.5, 0.5, 0.5, 1.0);
                    }
                    oFragColor = color;
                }
            `,
        ];
    }
    
    constructor() {
        super({ name: "grid" });
    }
}
