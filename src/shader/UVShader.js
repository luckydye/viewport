import { Resources } from '../Resources.js';
import { GLShader } from '../renderer/GLShader.js';

export default class UVShader extends GLShader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return `#version 300 es
            precision mediump float;
            
            in vec2 vTexCoords;
            out vec4 oFragColor;
            
            void main() {
                oFragColor = vec4(vTexCoords.xy, 1.0, 1.0);
            }
        `;
    }

}