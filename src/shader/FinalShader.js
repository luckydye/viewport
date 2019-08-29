import { Shader } from '../renderer/RendererShader.js';
import { Resources } from '../Resources.js';

export default class FinalShader extends Shader {

    static vertexSource() {
        return `#version 300 es

        layout(location = 0) in vec3 aPosition;
        layout(location = 1) in vec2 aTexCoords;

        uniform float aspectRatio;

        out vec2 vTexCoords;
        
        void main() {
            gl_Position = vec4(aPosition, 1.0);
            vTexCoords = aTexCoords;
        }`;
    }

    static fragmentSource() {
        return `#version 300 es

        precision mediump float;
        
        in vec2 vTexCoords;
        
        struct SceneProjection {
            mat4 model;
            mat4 view;
            mat4 projection;
        };
        uniform SceneProjection scene;
        
        uniform vec3 cameraPosition;
        
        uniform sampler2D colorBuffer;
        uniform sampler2D shadowBuffer;
        
        out vec4 oFragColor;
        
        void main() {
            vec4 color = texture(colorBuffer, vTexCoords);
            vec4 shadow = texture(shadowBuffer, vTexCoords);
            oFragColor = color;
        }`;
    }

}