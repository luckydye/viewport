import { Shader } from '../renderer/RendererShader';
import { Resources } from '../Resources.js';

export default class PrimitiveShader extends Shader {

    constructor() {
        super();

        this.drawmode = "LINES";
    }

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return `#version 300 es
        
        precision mediump float;
        
        in vec3 primitiveColor;
        
        out vec4 oFragColor;
        
        void main () {
            oFragColor = vec4(primitiveColor, .75);
        }`;
    }
}
