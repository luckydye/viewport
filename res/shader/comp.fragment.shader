#version 300 es
precision mediump float;

in vec2 texCoords;

uniform sampler2D depthBuffer;
uniform sampler2D diffuseBuffer;
uniform sampler2D lightBuffer;
uniform sampler2D reflectionBuffer;
uniform sampler2D guidesBuffer;
uniform sampler2D idBuffer;

uniform bool fog;

out vec4 oFragColor;

void main(void) {
    float depth = texture(depthBuffer, texCoords).r;
    vec4 color = texture(diffuseBuffer, texCoords);
    vec4 light = texture(lightBuffer, texCoords);
    vec4 reflection = texture(reflectionBuffer, texCoords);
    vec4 guides = texture(guidesBuffer, texCoords);
    vec4 id = texture(idBuffer, texCoords);

    if(color.a > 0.0) {
        oFragColor = color;
    }
    
    if(color.a > 0.0 && light.a > 0.0) {
        oFragColor *= light;
    }

    if(color.a == 0.0) {
        oFragColor = vec4(reflection.rgb * vec3(0.4, 0.4, 0.5) + vec3(0.1, 0.15, 0.8), 1.0);
        oFragColor *= light;
    }

    if(fog && color.a > 0.0) {
        vec3 fogColor = vec3(0.04);
        vec3 fogValue = vec3(pow(depth, 150.0)) * fogColor;
        oFragColor += vec4(fogValue, 1.0) * 2.0;
    }

	if(guides.a != 0.0) {
        if(color.a > 0.0) {
            // inside geometry
            oFragColor += guides * 0.15;
        } else {
            oFragColor = guides;
        }
        if(id.r == (1.0 / 255.0)) {
            // cursor
            oFragColor = vec4(guides.rgb + 0.33, 1.0);
        }
    }
}