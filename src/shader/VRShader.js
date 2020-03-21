import CompShader from './CompShader.js';

export default class VRShader extends CompShader {

    static fragmentSource() {
        return `#version 300 es

        precision mediump float;
        
        in vec2 vTexCoords;
        
        uniform sampler2D view0;
        uniform sampler2D view1;

        out vec4 oFragColor;

        void main() {
            vec4 view0 = texture(view0, vTexCoords);
            vec4 view1 = texture(view1, vTexCoords);

            oFragColor = view0 * 0.5;
            oFragColor += view1 * 0.5;
        }`;
    }

}
