import { Resources } from '../Resources.js';
import { Shader } from '../renderer/RendererShader.js';

Resources.add({
    'gbuffer.vs': 'shader/gbuffer.vertex.shader',
}, false);

export default class DefaultShader extends Shader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return `#version 300 es
            precision mediump float;
            
            in vec2 vTexCoords;
            in vec3 vNormal;
            in float id;
            
            struct Material {
                sampler2D texture;
                sampler2D specularMap;
                sampler2D normalMap;
                sampler2D displacementMap;
                vec4 diffuseColor;
                float specular;
                float roughness;
                float metallic;
                float transparency;
                float textureScale;
                bool scaleUniform;
                bool selected;
            };
            uniform Material material;
            
            out vec4 oFragColor;

            void DiffuseShading(out vec4 finalColor, vec3 normal) {
                float ambient = 0.5;
                vec3 norm = normalize(normal);
                vec3 lightDir = normalize(vec3(1.0, 0.5, 0.1));
                float diffuse = max(dot(norm, lightDir), 0.0) * (1.0 - ambient) + ambient;
                finalColor = vec4((finalColor * diffuse).rgb, 1.0);
            }

            void main() {
                vec2 imageSize = vec2(textureSize(material.texture, 0));
                vec2 textureCoords = vec2(vTexCoords.x, -vTexCoords.y);
            
                vec4 color = material.diffuseColor;
            
                if(imageSize.x > 0.0) {
                    vec4 texcolor = texture(material.texture, textureCoords);
                    color = (texcolor * texcolor.a) + color * (1.0 - texcolor.a);
                    color = vec4(color.rgb, color.a + texcolor.a);
                }

                oFragColor = vec4(color.rgb, color.a - material.transparency);

                DiffuseShading(oFragColor, vNormal);
            }
        `;
    }

}