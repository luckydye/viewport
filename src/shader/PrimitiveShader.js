import MeshShader from './MeshShader.js';

export default class PrimitiveShader extends MeshShader {

    constructor() {
        super();

        this.drawmode = "LINES";
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
