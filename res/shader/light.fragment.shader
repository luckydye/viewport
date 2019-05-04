#version 300 es
precision mediump float;

#define POINT_LIGHTS_COUNT 123
#define SHADOW_BIAS 0.000008

in vec4 vWorldPos;
in vec3 vNormal;
in mat4 vLightProjViewMatrix;
in vec2 vTexCoords;

uniform samplerCube cubemap;

uniform sampler2D shadowDepthMap;
uniform sampler2D specularMap;
uniform sampler2D normalMap;
uniform vec3 ambientcolor;
uniform float shadowcolor;
uniform vec3 cameraPosition;

struct SceneProjection {
	mat4 model;
	mat4 view;
	mat4 projection;
};
uniform SceneProjection scene;

struct Material {
    vec3 diffuseColor;
    float specular;
    float roughness;
    float metallic;
    float transparency;
    float textureScale;
    bool scaleUniform;
    bool selected;
};
uniform Material material;

struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
    float size;
};
uniform int lightCount;
uniform PointLight pointLights[POINT_LIGHTS_COUNT];

out vec4 oFragColor;

float Shadow(vec4 fragPosLightSpace) {
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;
    float closestDepth = texture(shadowDepthMap, projCoords.xy).r;
    float currentDepth = projCoords.z;
    
    float shadow = currentDepth - SHADOW_BIAS < closestDepth ? 1.0 : 0.0;

    return shadow;
}

vec3 Specular(PointLight light, vec3 vertPos, vec3 normal) {
    float dist = distance(cameraPosition, vertPos);
    vec3 viewDir = normalize(cameraPosition - vertPos);
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

void main () {
    vec4 specMap = texture(specularMap, vTexCoords);
    vec4 normMap = texture(normalMap, vTexCoords);

    vec3 ambient = ambientcolor;
    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);
    vec3 shadows = vec3(0.0);
    vec3 normal = vNormal;

    // if(normMap.r > 0.0) {
    //     normal *= normMap.rgb;
    // }

    vec4 shadow = Shadow(vLightProjViewMatrix * vWorldPos) * vec4(shadowcolor);
    shadows = shadow.rgb;

    for(int i = 0; i < lightCount; i++) {
        diffuse += Diffuse(pointLights[i], vWorldPos.xyz, normal);
        specular += Specular(pointLights[i], vWorldPos.xyz, normal);
    }

    diffuse *= specMap.rgb + 0.5;

    vec4 reflectNormal = vec4(normal.x, -normal.y, -normal.z, 1.0) * scene.model;
    vec3 reflection = texture(cubemap, reflectNormal.xyz).rgb;

    reflection *= material.metallic * specMap.rgb;
    specular *= material.specular * specMap.rgb;

    oFragColor = vec4(vec3(ambient + diffuse + specular + shadows + reflection), 1.0);
}
