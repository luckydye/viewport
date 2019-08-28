import { Resources } from '../Resources.js';
import { Shader } from '../renderer/RendererShader.js';

export default class UVShader extends Shader {

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