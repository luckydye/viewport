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
        uniform sampler2D depthBuffer;
        uniform sampler2D normalBuffer;
        
        out vec4 oFragColor;
        
        void main() {
            float depth = texture(depthBuffer, vTexCoords).r;
            vec4 color = texture(colorBuffer, vTexCoords);
            vec4 shadow = texture(shadowBuffer, vTexCoords);
            vec4 normal = texture(normalBuffer, vTexCoords);

            float selfShadow = clamp(pow(depth, 20.0), 0.75, 1.0);

            float fog = (pow(depth, 300.0) * 0.5);

            float ambient = 0.05;

            oFragColor = color * selfShadow + fog + ambient;
        }`;
    }

}