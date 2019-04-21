#version 300 es
precision mediump float;

in vec2 vTexCoords;
in vec3 vNormal;

uniform sampler2D colorTexture;
uniform sampler2D reflectionMap;

uniform bool textureized;
uniform float textureScale;
uniform float transparency;
uniform vec3 diffuseColor;

out vec4 oFragColor;

void main() {
    vec2 imageSize = vec2(textureSize(colorTexture, 0));
    vec2 textureCoords = vTexCoords / (imageSize.x / textureScale);

    if(textureized) {
        vec4 textureColor = texture(colorTexture, textureCoords);
        oFragColor = vec4(textureColor.rgb, 1.0 - transparency);
    } else {
        oFragColor = vec4(diffuseColor, 1.0 - transparency);
    }

    if(vNormal.y > 0.0) {
        oFragColor += 0.05;
    }

    if(vNormal.x < 0.0) {
        oFragColor += 0.05;
    }

    float reflectivenss = texture(reflectionMap, textureCoords).r;
    if(reflectivenss > 0.0 && vNormal.g > 0.99) {
        oFragColor = vec4(0.0, 1.0, 0.0, 0.0);
    }
}
