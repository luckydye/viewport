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
                vec3 diffuseColor;
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
                vec2 textureCoords = vec2(vTexCoords.x, -vTexCoords.y);
            
                vec4 color = vec4(0.0);
            
                vec4 tcolor = texture(material.texture, textureCoords);
                bool emptyTexture = (tcolor.r + tcolor.g + tcolor.b) == 0.0;
            
                if(emptyTexture) {
                    color += vec4(material.diffuseColor, 1.0 - material.transparency);
                } else {
                    color += tcolor;
                }
            
                oFragColor = vec4(color.rgb, 1.0 - material.transparency);
            }
        `;
    }

}