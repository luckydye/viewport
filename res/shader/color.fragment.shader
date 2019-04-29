#version 300 es
precision mediump float;

in vec2 vTexCoords;
in vec3 vNormal;
in float id;

struct Material {
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

uniform sampler2D colorTexture;
uniform sampler2D reflectionMap;

out vec4 oFragColor;

void main() {
    vec2 imageSize = vec2(textureSize(colorTexture, 0));
    vec2 textureCoords = vTexCoords / (imageSize.x / material.textureScale);

    vec4 color = vec4(0.0);

    vec4 tcolor = texture(colorTexture, textureCoords);
    bool emptyTexture = (tcolor.r + tcolor.g + tcolor.b) == 0.0;

    if(emptyTexture) {
        color += vec4(material.diffuseColor, 1.0 - material.transparency);
    } else {
        color += tcolor;
    }

    oFragColor = vec4(color.rgb, 1.0 - material.transparency);

    float reflectivenss = texture(reflectionMap, textureCoords).r;
    if(reflectivenss > 0.0 && vNormal.g > 0.99) {
        oFragColor = vec4(0.0, 1.0, 0.0, 0.0);
    }
}
