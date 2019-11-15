import MeshShader from './MeshShader.js';

export default class DefaultShader extends MeshShader {

    static defaultShading() {
        return `
            vec3 normal = getMappedValue(material.normalMap, vec4(vNormal, 1.0)).xyz;
            float specular = getMappedValue(material.specularMap, vec4(material.attributes.x)).r;
            float roughness = getMappedValue(material.roughnessMap, vec4(material.attributes.y)).r;

            // Specular(oFragColor, normal, specular, roughness);

            vec3 shadowColor = vec3(0.65, 0.65, 0.7);

            Shading(oFragColor, normal, shadowColor);
        `;
    }

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`

            uniform sampler2D shadowDepth;
            uniform Material material;
            uniform int currentMaterialIndex;
            uniform mat4 shadowProjMat;
            uniform mat4 shadowViewMat;

            vec2 TextureCoords() {
                float scale = 1.0;

                if (currentMaterialIndex != materialIndex) {
                    discard;
                }

                vec2 displace = texture(material.displacementMap, vTexCoords.xy).rg;

                return (vTexCoords.xy / scale) + displace.xy;
            }

            vec4 getMappedValue(sampler2D image, vec4 value) {
                vec4 mapped = texture(image, TextureCoords());
                if(mapped.a > 0.0) {
                    value *= vec4(mapped.rgb, 1.0);
                }
                return value;
            }
            
            void Specular(out vec4 finalColor, vec3 normal, float strength, float roughness) {

                vec3 norm = normalize(normal);
                vec3 lightDir = normalize((vec4(1.0) * shadowViewMat).xyz);

                vec3 viewDir = normalize(vViewPos - vWorldPos.xyz);
                vec3 reflectDir = reflect(-lightDir, norm);

                float specular = pow(max(dot(viewDir, reflectDir), 0.0), roughness * 32.0);

                finalColor += specular * strength;
            }

            float saturate(float value) {
                return clamp(value, 0.0, 1.0);
            }

            void Fresnel(out vec4 finalColor, vec3 normal) {
                vec3 viewDir = normalize(vViewPos - vWorldPos.xyz);
                float fresnel = dot(normal, viewDir);
                fresnel = saturate(1.0 - fresnel);
                fresnel = pow(fresnel, 75.0);
                finalColor += vec4(vec3(1., .0, .0) * fresnel, 0.0);
            }

            void Shading(out vec4 finalColor, vec3 normal, vec3 shadowColor) {

                vec4 v_Vertex_relative_to_light = shadowProjMat * shadowViewMat * vWorldPos;
                vec3 light_pos = v_Vertex_relative_to_light.xyz / v_Vertex_relative_to_light.w;

                vec3 vertex_relative_to_light = light_pos * 0.5 + 0.5;

                vec2 shadowTexCoord = vec2(
                    clamp(vertex_relative_to_light.x, 0.0, 1.0),
                    clamp(vertex_relative_to_light.y, 0.0, 1.0)
                );

                vec4 shadowmap_color1 = texture(shadowDepth, vec2(shadowTexCoord.x, shadowTexCoord.y));
                float shadowmap_distance = shadowmap_color1.r;

                float bias = 0.00005;

                float illuminated = step(vertex_relative_to_light.z, shadowmap_distance + bias);

                vec3 norm = normalize(normal);
                vec3 lightDir = normalize((vec4(1.0) * shadowViewMat).xyz);
                float diffuse = max(dot(norm, lightDir), 0.0);

                vec3 ambientLight = vec3(0.5);
                finalColor.rgb *= vec3(diffuse * (vec3(1.0) - ambientLight) + ambientLight);

                float listDist = vertex_relative_to_light.z;

                if(illuminated < 1.0 && listDist > 0.01) {
                    finalColor.rgb *= shadowColor;
                }
            }

            void main() {
                // albedo
                vec4 color = material.diffuseColor;
                vec4 texcolor = texture(material.texture, TextureCoords());

                color = (texcolor * texcolor.a) + color * (1.0 - texcolor.a);
                color = vec4(color.rgb, color.a + texcolor.a / 2.0);

                oFragColor = color;

                ${this.defaultShading()}
            }
        `;
    }

}