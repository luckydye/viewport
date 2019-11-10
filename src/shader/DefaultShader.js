import MeshShader from './MeshShader.js';

export default class DefaultShader extends MeshShader {

    static defaultShading() {
        return `
            vec3 normal = getMappedValue(material.normalMap, vec4(vNormal, 1.0)).xyz;
            float specular = getMappedValue(material.specularMap, vec4(material.specular)).r;
            float roughness = getMappedValue(material.roughnessMap, vec4(material.roughness)).r;

            Specular(oFragColor, normal, specular, roughness);
            Shading(oFragColor, normal, shadowColor);
        `;
    }

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`

            uniform Material material;
            uniform float materialIndex;

            uniform sampler2D shadowDepth;
            uniform mat4 shadowProjMat;
            uniform mat4 shadowViewMat;
            
            uniform vec4 shadowColor;
            uniform float ambientLight;

            vec2 TextureCoords() {
                float scale = 1.0;

                if(vTexCoords.x > materialIndex || vTexCoords.y > materialIndex) {
                    discard;
                }

                if(material.textureScale > 0.0) {
                    vec2 imageSize = vec2(textureSize(material.texture, 0));
                    scale = (imageSize.x / material.textureScale);
                }

                vec2 displace = texture(material.displacementMap, vTexCoords).rg;

                return (vTexCoords / scale) + displace.xy;
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

            void Shading(out vec4 finalColor, vec3 normal, vec4 shadowColor) {

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

                finalColor.rgb *= vec3(diffuse * (1.0 - ambientLight) + ambientLight);

                if(illuminated < 1.0) {
                    finalColor.rgb *= 1.0 - shadowColor.a;
                }
            }

            void main() {
                // albedo
                vec4 color = material.diffuseColor;
                vec4 texcolor = texture(material.texture, TextureCoords());

                color = (texcolor * texcolor.a) + color * (1.0 - texcolor.a);
                color = vec4(color.rgb, color.a + texcolor.a / 2.0);

                oFragColor = vec4(color.rgb, color.a - material.transparency);

                ${this.defaultShading()}
            }
        `;
    }

}