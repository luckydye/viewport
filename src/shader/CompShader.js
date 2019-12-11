import { Shader } from '../renderer/RendererShader.js';

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
        uniform sampler2D normal;
        uniform sampler2D index;
        uniform sampler2D lighting;

        uniform vec2 resolution;
        uniform mat4 shadowProjMat;
        uniform mat4 shadowViewMat;

        uniform float fogMax;
        uniform float fogDensity;
        uniform float fogStartOffset;

        out vec4 oFragColor;

        vec2 rand( vec2 coord ) {
            vec2 noise;
            float nx = dot ( coord, vec2( 12.9898, 78.233 ) );
            float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );
            noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );
            return ( noise * 2.0  - 1.0 ) * 0.0003;
        }

        vec4 rgb2hsb( in vec4 c ) {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz),
                         vec4(c.gb, K.xy),
                         step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r),
                         vec4(c.r, p.yzx),
                         step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec4(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                        d / (q.x + e),
                        q.x, 0.0);
        }

        vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
            vec4 color = vec4(0.0);
            vec2 off1 = vec2(1.411764705882353) * direction;
            vec2 off2 = vec2(3.2941176470588234) * direction;
            vec2 off3 = vec2(5.176470588235294) * direction;
            color += texture(image, uv) * 0.1964825501511404;
            color += texture(image, uv + (off1 / resolution)) * 0.2969069646728344;
            color += texture(image, uv - (off1 / resolution)) * 0.2969069646728344;
            color += texture(image, uv + (off2 / resolution)) * 0.09447039785044732;
            color += texture(image, uv - (off2 / resolution)) * 0.09447039785044732;
            color += texture(image, uv + (off3 / resolution)) * 0.010381362401148057;
            color += texture(image, uv - (off3 / resolution)) * 0.010381362401148057;
            return color;
        }

        const float gamma = 2.2;
        const float exposure = 1.0;

        void main() {
            vec4 normal = texture(normal, vTexCoords);
            vec4 guides = texture(guides, vTexCoords);
            vec4 guidesDepth = texture(guidesDepth, vTexCoords);
            vec4 depth = texture(depth, vTexCoords);
            vec4 index = texture(index, vTexCoords);

            oFragColor = texture(color, vTexCoords);

            vec4 bloom = blur13(lighting, vTexCoords, resolution, vec2(1.0, 0.0));
            bloom += blur13(lighting, vTexCoords, resolution, vec2(0.0, 1.0));

            oFragColor += bloom * 0.4;

            // depth fog
            oFragColor.rgb += min(pow(depth.r - fogStartOffset, fogDensity), fogMax);
            
            // color correction
            // oFragColor.rgb = vec3(1.0) - exp(-oFragColor.rgb * exposure);
            // oFragColor.rgb = pow(oFragColor.rgb, vec3(1.0 / gamma));

            // guides
            if(guides.a < 0.9 && guides.a > 0.0) {
                oFragColor.rgb = guides.rgb;
            }
            if(guidesDepth.r > 0.0 && guidesDepth.r < depth.r) {
                oFragColor = vec4(guides.rgb, 1.0);
            }
        }`;
    }

}