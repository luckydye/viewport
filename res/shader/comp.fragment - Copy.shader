#version 300 es
precision mediump float;

#define FOG true

#define POINT_LIGHTS_COUNT 123
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
uniform PointLight pointLights[POINT_LIGHTS_COUNT];

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

vec3 Diffuse(PointLight light, vec3 vertPos, vec3 normal) {
    vec3 lightDir = normalize(light.position - vertPos);
    float diff = max(dot(normal, lightDir), 0.0);

    float dist = length(light.position - vertPos) / (light.size * 50.0);
    float attenuation = 1.0 / pow(dist, light.intensity);

    vec3 diffuse = light.color * diff;
    diffuse *= attenuation;

    if(dist < 0.115) {
        diffuse = light.color;
    }
    
    return diffuse;
}

vec3 lighting() {
    vec3 specMap = texture(specBuffer, vTexCoords).rgb;
    vec3 normal = texture(normalBuffer, vTexCoords).rgb;
    vec4 worldPos = texture(worldBuffer, vTexCoords);

    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);
    vec3 shadows = vec3(0.0);

    vec3 shadow = (Shadow(lightProjViewMatrix * worldPos, shadowBuffer) * vec4(0.15)).rgb;
    return worldPos.xyz;

    for(int i = 0; i < lightCount; i++) {
        diffuse += Diffuse(pointLights[i], worldPos.xyz, normal);
        specular += Specular(pointLights[i], worldPos.xyz, normal);
    }

    diffuse += specMap * 0.33;

    vec4 reflectNormal = vec4(normal.x, -normal.y, -normal.z, 1.0) * scene.model;
    vec3 reflection = texture(cubemap, reflectNormal.xyz).rgb;

    reflection *= specMap;
    specular *= specMap;

    return diffuse + specular + shadow + reflection;
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
    vec4 light = vec4(lighting(), 1.0);

    float power = 1000.0;
    oFragColor = vec4(pow(shadow.r, power), pow(shadow.g, power), pow(shadow.b, power), 1.0);
    return;

    if(color.a > 0.0) {
        oFragColor = color;
    }

    if(color.a > 0.0 && light.a > 0.0) {
        oFragColor *= light;
    }
    
    if(FOG) {
        float fogValue = pow(depth.r, 600.0) * 0.15;
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

    oFragColor = vec4(1.0);
}
