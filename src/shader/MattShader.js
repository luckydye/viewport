import { Resources } from '../Resources.js';
import { GLShader } from './GLShader.js';

export default class MattShader extends GLShader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return `#version 300 es
            precision mediump float;
            
            in float id;
            
            out vec4 oFragColor;
            
            void main () {
                oFragColor = vec4(id, id, id, 1.0);
            }
        `;
    }
    
    constructor() {
        super({ name: "color" });
    }

}