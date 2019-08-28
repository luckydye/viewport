#version 300 es
precision mediump float;

#define FOG true

#define POINT_LIGHTS_COUNT 10
#define SHADOW_BIAS 0.000008

in vec2 vTexCoords;

struct SceneProjection {
	mat4 model;
	mat4 view;
	mat4 projection;
};
uniform SceneProjection scene;

struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
    float size;
};
uniform int lightCount;
uniform PointLight lights[POINT_LIGHTS_COUNT];

uniform mat4 lightProjViewMatrix;

uniform vec3 cameraPosition;

uniform samplerCube cubemap;

uniform sampler2D colorBuffer;
uniform sampler2D guidesBuffer;

uniform bool fog;

out vec4 oFragColor;

void main() {
    vec4 color = texture(colorBuffer, vTexCoords);

    oFragColor = color;
}
