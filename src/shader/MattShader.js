import { Resources } from '../Resources.js';
import { Shader } from '../renderer/RendererShader';

export default class MattShader extends Shader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return `#version 300 es
            precision mediump float;
            
            in float id;
            
            out vec4 oFragColor;
            
            void main () {
                float c = id / 255.0;
                oFragColor = vec4(c, c, c, 1.0);
            }
        `;
    }

}