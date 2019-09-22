import MeshShader from './MeshShader.js';

export default class DefaultShader extends MeshShader {

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`

            uniform Material material;

            uniform sampler2D shadowDepth;
            uniform mat4 shadowProjMat;
            uniform mat4 shadowViewMat;
            
            uniform vec3 lightDirection;
            uniform float ambientLight;
            
            void DiffuseShading(out vec4 finalColor, vec3 normal, float ambient) {
                vec3 norm = normalize(normal);
                vec3 lightDir = normalize(lightDirection);
                float diffuse = max(dot(norm, lightDir), 0.0) * (1.0 - ambient) + ambient;

                finalColor *= vec4(vec3(diffuse), 1.0);
            }
            
            void Specular(out vec4 finalColor, vec3 normal, float strength, float roughness) {

                vec3 norm = normalize(normal);
                vec3 lightDir = normalize(lightDirection);

                vec3 viewDir = normalize(vViewPos - vWorldPos.xyz);
                vec3 reflectDir = reflect(-lightDir, norm);

                float specular = pow(max(dot(viewDir, reflectDir), 0.0), roughness * 32.0);

                finalColor += specular * strength;
            }

            vec4 getMappedValue(sampler2D image, vec4 value) {
                vec4 mapped = texture(image, vTexCoords);

                if(mapped.a > 0.0) {
                    value *= vec4(mapped.rgb, 1.0);
                }

                return value;
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

            vec4 powVec4(vec4 vec, float value) {
                vec.r = pow(vec.r, value);
                vec.g = pow(vec.g, value);
                vec.b = pow(vec.b, value);
                vec.a = pow(vec.a, value);
                return vec;
            }

            void Shadow(out vec4 finalColor, vec3 normal) {

                vec4 v_Vertex_relative_to_light = shadowProjMat * shadowViewMat * vWorldPos;

                vec3 vertex_relative_to_light = v_Vertex_relative_to_light.xyz / v_Vertex_relative_to_light.w;
                vertex_relative_to_light = vertex_relative_to_light * 0.5 + 0.5;

                vec2 shadowTexCoord = vec2(
                    clamp(vertex_relative_to_light.x, 0.0, 1.0),
                    clamp(vertex_relative_to_light.y, 0.0, 1.0)
                );
                vec4 shadowmap_color = texture(shadowDepth, shadowTexCoord);

                float shadowmap_distance = shadowmap_color.r;

                if (vertex_relative_to_light.z <= shadowmap_distance + 0.0000002) {
                    finalColor.rgb *= 1.0;
                } else {
                    finalColor.rgb *= 0.5;
                }
            }

            void defaultShading() {
                // diffuse
                vec3 normal = getMappedValue(material.normalMap, vec4(vNormal * 100.0, 1.0)).xyz;

                DiffuseShading(oFragColor, normal, ambientLight);

                Shadow(oFragColor, normal);

                // specular
                float specular = getMappedValue(material.specularMap, vec4(material.specular)).r;
                float roughness = getMappedValue(material.roughnessMap, vec4(material.roughness)).r;

                Specular(oFragColor, normal, specular, roughness);

                // Fresnel(oFragColor, vNormal);
            }
            
            void main() {
            
                // albedo
                vec4 color = material.diffuseColor;
                vec4 texcolor = texture(material.texture, vTexCoords);

                color = (texcolor * texcolor.a) + color * (1.0 - texcolor.a);
                color = vec4(color.rgb, color.a + texcolor.a / 2.0);

                oFragColor = vec4(color.rgb, color.a - material.transparency);

                defaultShading();
            }
        `;
    }

}