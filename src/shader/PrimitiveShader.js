import { GLShader } from './GLShader.js';
import { Resources } from '../Resources.js';

export default class PickingShader extends GLShader {

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
