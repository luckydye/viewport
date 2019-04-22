#version 300 es

#define POINT_SIZE 5.0;

layout(std140, column_major) uniform;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoords;
layout(location = 2) in vec3 aNormal;

struct SceneProjection {
	mat4 model;
	mat4 view;
	mat4 projection;
};

uniform SceneProjection scene;
uniform sampler2D displacementMap;
uniform mat4 lightProjViewMatrix;

out vec2 vTexCoords;
out vec4 vWorldPos;
out vec3 vNormal;
out vec3 vertexPos;
out mat4 vLightProjViewMatrix;
out float id;

void main() {
	float instance = float(gl_InstanceID);

	vec4 pos = scene.model * vec4(aPosition, 1.0) + vec4(aNormal * (instance * 50.0), 1.0);

	float bump = texture(displacementMap, aTexCoords).r * 200.0;

	float xbump = bump * aNormal.x;
	float ybump = bump * (aNormal.y-1.0 * -1.0);
	float zbump = bump * aNormal.z;

	gl_Position = scene.projection * scene.view * vec4(pos.x + xbump, pos.y + ybump, pos.z + zbump, 1.0);
	gl_PointSize = 5.0;

	vLightProjViewMatrix = lightProjViewMatrix;
	vertexPos = aPosition;
	vWorldPos = pos;
	vNormal = aNormal;
	vTexCoords = aTexCoords;
	id = instance;
}
