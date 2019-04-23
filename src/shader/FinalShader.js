import { GLShader } from './GLShader.js';
import { Resources } from '../Resources.js';

Resources.add({
    'comp.fs': require('../../res/shader/comp.fragment.shader'),
}, false);

export default class FinalShader extends GLShader {

    static vertexSource() {
        return `#version 300 es

        layout(location = 0) in vec3 aPosition;
        layout(location = 1) in vec2 aTexCoords;

        uniform float aspectRatio;

        out vec2 texCoords;
        
        void main() {
            gl_Position = vec4(aPosition, 1.0);
            texCoords = aTexCoords;
        }`;
    }

    static fragmentSource() {
        return Resources.get('comp.fs');
    }

}