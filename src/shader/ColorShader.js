import { Resources } from '../Resources.js';
import { GLShader } from '../renderer/GLShader.js';

Resources.add({
    'gbuffer.vs': 'shader/gbuffer.vertex.shader',
}, false);

export default class ColorShader extends GLShader {

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
            
            void main() {
                vec2 imageSize = vec2(textureSize(material.texture, 0));
                vec2 textureCoords = vec2(vTexCoords.x, -vTexCoords.y);
            
                vec4 texcolor = texture(material.texture, textureCoords);
            
                vec4 color = material.diffuseColor;

                if(imageSize.x > 0.0) {
                    if(texcolor.a < 1.0) {
                        color.rgb += texcolor.rgb;
                    } else {
                        color = texcolor;
                    }
                }
            
                oFragColor = vec4(color.rgb, color.a - material.transparency);
            }
        `;
    }

}