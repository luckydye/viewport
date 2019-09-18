import MeshShader from './MeshShader.js';

export default class NormalShader extends MeshShader {

    static fragmentSource() {
        return `#version 300 es
            precision mediump float;
            
            in vec2 vTexCoords;
            in vec4 vTexelPos;
            in vec3 vNormal;
            
            out vec4 oFragColor;

            void main() {
                oFragColor = vec4(normalize(vNormal * 100.0 + 1.0), 1.0);
            }
        `;
    }

}