#version 300 es
precision mediump float;

struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
    float size;
};

in vec4 vWorldPos;
in vec3 vNormal;
in vec3 vertexPos;
in mat4 vLightProjViewMatrix;

uniform sampler2D depthBuffer;
uniform sampler2D shadowDepthMap;

uniform vec3 uAmbientColor;
uniform float shadowcolor;

#define POINT_LIGHTS_COUNT 4

uniform PointLight pointLights[POINT_LIGHTS_COUNT];

out vec4 oFragColor;

float ShadowCalculation(vec4 fragPosLightSpace) {
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;
    float closestDepth = texture(shadowDepthMap, projCoords.xy).r;
    float currentDepth = projCoords.z;
    
    float bias = 0.00000075;
    float shadow = currentDepth - bias < closestDepth ? 1.0 : 0.0;

    return shadow;
}

vec3 CalculatePointLight(PointLight light, vec3 vertPos, vec3 normal) {

    vec3 lightDir = normalize(light.position - vertPos);
    float diff = max(dot(normal, lightDir), 0.0);

    float dist = length(light.position - vertPos) / (light.size * 50.0);

    float attenuation = 1.0 / pow(dist, light.intensity);

    vec3 diffuse = light.color * diff * light.color;
    diffuse *= attenuation;

    if(dist < 0.115) {
        diffuse = light.color;
    }
    
    return diffuse;
}

void main () {
    // shadows
    vec4 fragPosLightSpace = vLightProjViewMatrix * vWorldPos;
    float shadow = ShadowCalculation(fragPosLightSpace);
    oFragColor = vec4(vec3(shadow * shadowcolor), 1.0);
    
    // ambient
    vec3 ambientColor = uAmbientColor;
    oFragColor += vec4(ambientColor, 1.0);

    // pointlights
    for(int i = 0; i < POINT_LIGHTS_COUNT; i++) {
        if(pointLights[i].intensity != 0.0) {
            vec3 lightColor = CalculatePointLight(pointLights[i], vWorldPos.xyz, vNormal);
            oFragColor += vec4(lightColor, 1.0);
        }
    }
}
