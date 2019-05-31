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

uniform sampler2D normalBuffer;
uniform sampler2D worldBuffer;
uniform sampler2D uvBuffer;
uniform sampler2D specBuffer;
uniform sampler2D shadowBuffer;
uniform sampler2D depthBuffer;
uniform sampler2D colorBuffer;
uniform sampler2D guidesBuffer;
uniform sampler2D idBuffer;

uniform bool fog;

out vec4 oFragColor;

float Shadow(vec4 fragPosLightSpace, sampler2D shadowDepthMap) {
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;
    float closestDepth = texture(shadowDepthMap, projCoords.xy).r;
    float currentDepth = projCoords.z;
    
    return currentDepth - SHADOW_BIAS < closestDepth ? 1.0 : 0.0;
}

vec3 Specular(PointLight light, vec3 vertPos, vec3 normal) {
    vec3 cam = normalize(cameraPosition);
    float dist = distance(cam, vertPos);
    vec3 viewDir = normalize(cam - vertPos);
    vec3 lightDir = normalize(light.position - vertPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), dist);

    return light.color * spec;
}

float Dither(vec2 fragPos, float value) {
    float x = mod(fragPos.x * 1004.0, 2.0);
    float y = mod(fragPos.y * 768.0, 2.0);

    if(y == 0.0 && x == 0.0 && value > 64.0) {
        return value;
    }
    if(y == 0.0 && x == 1.0 && value > 128.0) {
        return value;
    }
    if(y == 1.0 && x == 0.0 && value > 192.0) {
        return value;
    }
    if(y == 1.0 && x == 1.0 && value > 0.0) {
        return value;
    }
}

void main() {
    vec4 shadow = texture(shadowBuffer, vTexCoords);
    vec4 normal = texture(normalBuffer, vTexCoords);
    vec4 world = texture(worldBuffer, vTexCoords);
    vec4 uv = texture(uvBuffer, vTexCoords);
    vec4 depth = texture(depthBuffer, vTexCoords);
    vec4 color = texture(colorBuffer, vTexCoords);
    vec4 guides = texture(guidesBuffer, vTexCoords);
    vec4 id = texture(idBuffer, vTexCoords);
    
    vec3 specMap = texture(specBuffer, vTexCoords).rgb;
    vec3 position = texture(worldBuffer, vTexCoords).rgb;

    vec4 lighting = color * 0.1;

    for(int i = 0; i < lightCount; i++) {
        vec3 lightDir = normalize(lights[i].position - position);
        vec3 diffuse = max(dot(normal.rgb, lightDir), 0.0) * color.rgb * lights[i].color;
        lighting += vec4(diffuse, 1.0);
    }

    if(color.a > 0.0) {
        oFragColor = color;
    }

    if(color.a > 0.0 && lighting.a > 0.0) {
        oFragColor *= lighting;
    }
    
    if(FOG) {
        float fogValue = pow(depth.r, 100.0) * 0.1;
        oFragColor += vec4(vec3(fogValue), 1.0);
    }

    // guides
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
