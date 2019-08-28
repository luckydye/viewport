import { Resources } from '../Resources.js';
import { Shader } from '../renderer/RendererShader.js';

export default class WorldShader extends Shader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return `#version 300 es
            precision mediump float;
            
            in vec4 vWorldPos;
            out vec4 oFragColor;
            
            void main() {
                oFragColor = vec4(normalize(vWorldPos.xyz), 1.0);
            }
        `;
    }

}