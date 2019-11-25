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
        uniform sampler2D world;

        uniform mat4 shadowProjMat;
        uniform mat4 shadowViewMat;

        out vec4 oFragColor;

        void Shading(out vec4 finalColor, vec3 normal) {
            vec3 norm = normalize(normal);
            vec3 lightDir = normalize((vec4(1.0) * shadowViewMat).xyz);
            float diffuse = max(dot(norm, lightDir), 0.0);

            vec3 ambientLight = vec3(0.5);
            finalColor.rgb *= vec3(diffuse * (vec3(1.0) - ambientLight) + ambientLight);
        }

        void main() {
            vec4 world = texture(world, vTexCoords);
            vec4 normal = texture(normal, vTexCoords);
            vec4 guides = texture(guides, vTexCoords);
            vec4 guidesDepth = texture(guidesDepth, vTexCoords);
            vec4 finalColor = texture(color, vTexCoords);
            vec4 depth = texture(depth, vTexCoords);
            
            Shading(finalColor, normal.rgb);

            finalColor.rgb += min(pow(depth.r - 0.05, 100.0), 0.25);

            if(guidesDepth.r > 0.0 && guidesDepth.r <= depth.r) {
                finalColor += guides;
            }

            oFragColor = finalColor;
        }`;
    }

}