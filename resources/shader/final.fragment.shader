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

const float radius = 5.0;

vec4 blur(sampler2D textureBuffer, vec2 texCoord, float resolution, vec2 dir) {
	vec4 sum = vec4(0.0);
	vec2 tc = texCoord;

	float blur = radius/resolution;
	float hstep = dir.x;
	float vstep = dir.y;

	sum += texture(textureBuffer, vec2(tc.x - 4.0*blur*hstep, tc.y - 4.0*blur*vstep)) * 0.0162162162;
	sum += texture(textureBuffer, vec2(tc.x - 3.0*blur*hstep, tc.y - 3.0*blur*vstep)) * 0.0540540541;
	sum += texture(textureBuffer, vec2(tc.x - 2.0*blur*hstep, tc.y - 2.0*blur*vstep)) * 0.1216216216;
	sum += texture(textureBuffer, vec2(tc.x - 1.0*blur*hstep, tc.y - 1.0*blur*vstep)) * 0.1945945946;

	sum += texture(textureBuffer, vec2(tc.x, tc.y)) * 0.2270270270;

	sum += texture(textureBuffer, vec2(tc.x + 1.0*blur*hstep, tc.y + 1.0*blur*vstep)) * 0.1945945946;
	sum += texture(textureBuffer, vec2(tc.x + 2.0*blur*hstep, tc.y + 2.0*blur*vstep)) * 0.1216216216;
	sum += texture(textureBuffer, vec2(tc.x + 3.0*blur*hstep, tc.y + 3.0*blur*vstep)) * 0.0540540541;
	sum += texture(textureBuffer, vec2(tc.x + 4.0*blur*hstep, tc.y + 4.0*blur*vstep)) * 0.0162162162;

	return sum;
}

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

	// oFragColor = light;

	// 	bloom
	// vec2 imageSize = vec2(textureSize(bloomBuffer, 0));
	// vec3 bloomX = blur(bloomBuffer, texCoords, imageSize.x, vec2(1.0, 0.0)).rgb;
	// oFragColor += vec4(bloomX, 1.0);
	// vec3 bloomY = blur(bloomBuffer, texCoords, imageSize.x, vec2(0.0, 1.0)).rgb;
	// oFragColor += vec4(bloomY, 1.0);
}
