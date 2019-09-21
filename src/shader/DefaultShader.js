import MeshShader from './MeshShader.js';

export default class DefaultShader extends MeshShader {

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`

            uniform Material material;
            
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
                    value *= vec4(mapped.rgb * mapped.a, 1.0);
                }

                return value;
            }

            void defaultShading() {
                // diffuse
                vec3 normal = getMappedValue(material.normalMap, vec4(vNormal * 100.0, 1.0)).xyz;

                DiffuseShading(oFragColor, normal, ambientLight);

                // specular
                float specular = getMappedValue(material.specularMap, vec4(material.specular)).r;
                float roughness = getMappedValue(material.roughnessMap, vec4(material.roughness)).r;

                Specular(oFragColor, normal, specular, roughness);
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