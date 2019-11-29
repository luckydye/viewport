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
        uniform sampler2D shadow;
        uniform sampler2D guides;
        uniform sampler2D guidesDepth;
        uniform sampler2D normal;

        uniform mat4 shadowProjMat;
        uniform mat4 shadowViewMat;

        out vec4 oFragColor;

        vec2 rand( vec2 coord ) {
            vec2 noise;
            float nx = dot ( coord, vec2( 12.9898, 78.233 ) );
            float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );
            noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );
            return ( noise * 2.0  - 1.0 ) * 0.0003;
        }

        void main() {
            vec4 normal = texture(normal, vTexCoords);
            vec4 guides = texture(guides, vTexCoords);
            vec4 guidesDepth = texture(guidesDepth, vTexCoords);
            vec4 color = texture(color, vTexCoords);
            vec4 depth = texture(depth, vTexCoords);

            // finalColor.rgb += min(pow(depth.r - 0.05, 100.0), 0.25);

            oFragColor = color;
            
            // guides
            if(guidesDepth.r > 0.0 && guidesDepth.r < depth.r) {
                oFragColor = guides;
            }
        }`;
    }

}