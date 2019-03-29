import { GLShader } from "../graphics/GLShader.js";
import { Resources } from "../Resources.js";

Resources.add({
    'final.fs': require('../../res/shader/final.fragment.shader'),
}, false);

export default class FinalShader extends GLShader {

    static get source() {
        return [
            `#version 300 es

                layout(location = 0) in vec3 aPosition;
                layout(location = 1) in vec2 aTexCoords;

                uniform float aspectRatio;

                out vec2 texCoord;
                
                void main() {
                    gl_Position = vec4(aPosition, 1.0);

                    texCoord = aTexCoords;
                }
            `,
            Resources.get('final.fs')
        ];
    }

    constructor() {
        super({ name: "final" });
    }

}