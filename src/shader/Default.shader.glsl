#version 300 es
precision mediump float;

in vec2 vTexCoords;
in vec4 vTexelPos;
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

uniform sampler2D shadowBuffer;

out vec4 oFragColor;

float DiffuseShading(vec3 normal) {
    float ambient = 0.5;
    vec3 norm = normalize(normal);
    vec3 lightDir = normalize(vec3(0.5, 0.4, 0.33));
    float diffuse = max(dot(norm, lightDir), 0.0) * (1.0 - ambient) + ambient;
    return diffuse;
}

float Shadow(vec3 normal) {
    float ambient = 0.5;
    vec3 norm = normalize(normal);
    vec3 lightDir = normalize(vec3(0.5, 0.4, 0.33));
    float diffuse = max(dot(norm, lightDir), 0.0) * (1.0 - ambient) + ambient;
    return diffuse;
}

void main() {
    vec2 imageSize = vec2(textureSize(material.texture, 0));
    
    vec4 color = material.diffuseColor;
    
    float scale = (imageSize.x / material.textureScale);

    vec2 textureCoords = vTexCoords / scale;

    if(imageSize.x > 0.0) {
        vec4 texcolor = texture(material.texture, textureCoords);
        color = (texcolor * texcolor.a) + color * (1.0 - texcolor.a);
        color = vec4(color.rgb, color.a + texcolor.a / 2.0);
    }

    float shade = DiffuseShading(vNormal);

    vec4 pos = normalize(vTexelPos);
    vec4 shadow = texture(shadowBuffer, pos.xy);

    oFragColor = vec4(color.rgb * shade, color.a - material.transparency);
}