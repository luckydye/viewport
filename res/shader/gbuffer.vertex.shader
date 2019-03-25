#version 300 es

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoords;
layout(location = 2) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat4 uNormalMatrix;

uniform sampler2D displacementMap;

uniform mat4 lightProjViewMatrix;

uniform float uTime;

out vec2 vTexCoords;
out vec4 vWorldPos;
out vec3 vNormal;
out vec3 vertexPos;
out mat4 vLightProjViewMatrix;

void main() {
  vec4 pos = uModelMatrix * vec4(aPosition, 1.0);

  float bump = texture(displacementMap, aTexCoords).r * 200.0;

  float xbump = bump * aNormal.x;
  float ybump = bump * (aNormal.y-1.0 * -1.0);
  float zbump = bump * aNormal.z;

  gl_Position = uProjMatrix * uViewMatrix * vec4(pos.x + xbump, pos.y + ybump, pos.z + zbump, 1.0);
  gl_PointSize = 5.0;

  vLightProjViewMatrix = lightProjViewMatrix;
  vertexPos = aPosition;
  vWorldPos = pos;
  vNormal = aNormal;
  vTexCoords = aTexCoords;
}
