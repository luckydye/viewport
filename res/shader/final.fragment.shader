#version 300 es
precision mediump float;

in vec2 texCoord;

uniform sampler2D depthBuffer;
uniform sampler2D diffuseBuffer;
uniform sampler2D lightBuffer;
uniform sampler2D reflectionBuffer;
uniform sampler2D bloomBuffer;

uniform bool fog;

out vec4 oFragColor;

void main(void) {
	vec2 texCoords = texCoord;
	
	float depth = texture(depthBuffer, texCoords).r;
	vec4 color = texture(diffuseBuffer, texCoords);
	vec4 light = texture(lightBuffer, texCoords);
	vec4 reflection = texture(reflectionBuffer, texCoords);

	oFragColor = vec4(color.rgb, 1.0);
	
	oFragColor *= light;

	if(color.g == 1.0 && color.r == 0.0 && color.b == 0.0) {
		oFragColor = vec4(reflection.rgb * vec3(0.4, 0.4, 0.5) + vec3(0.1, 0.15, 0.8), 1.0);
		oFragColor *= light;
	}

	if(fog) {
		vec3 fogColor = vec3(0.04);
		vec3 fogValue = vec3(pow(depth, 150.0)) * fogColor;
		oFragColor += vec4(fogValue, 1.0) * 2.0;
	}
}
