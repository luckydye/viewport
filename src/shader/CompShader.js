import { Shader } from '../renderer/RendererShader.js';
import { Resources } from '../Resources.js';

export default class CompShader extends Shader {

    static vertexSource() {
        return `#version 300 es

        layout(location = 0) in vec3 aPosition;
        layout(location = 1) in vec2 aTexCoords;

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
        
        uniform sampler2D color;
        uniform sampler2D depth;
        uniform sampler2D guides;
        uniform sampler2D guidesDepth;

        out vec4 oFragColor;

        void main() {
            vec4 finalColor = texture(color, vTexCoords);

            oFragColor = finalColor;
            
            vec4 depth = texture(depth, vTexCoords);
            vec4 guidesDepth = texture(guidesDepth, vTexCoords);

            if(guidesDepth.r > 0.0 && guidesDepth.r < depth.r) {
                oFragColor = texture(guides, vTexCoords);
            }

            oFragColor.rgb += min(pow(depth.r, 100.0), 0.25);
        }`;
    }

}