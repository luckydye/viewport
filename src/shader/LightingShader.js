import MeshShader from './MeshShader.js';

export default class LightingShader extends MeshShader {

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`

            uniform sampler2D shadow;
            uniform Material material;
            uniform int currentMaterialIndex;
            uniform mat4 shadowProjMat;
            uniform mat4 shadowViewMat;

            void Shading(out vec4 finalColor, vec3 normal, vec3 shadowColor, vec3 lightColor) {
                vec4 v_Vertex_relative_to_light = shadowProjMat * shadowViewMat * vWorldPos;
                vec3 light_pos = v_Vertex_relative_to_light.xyz / v_Vertex_relative_to_light.w;

                vec3 vertex_relative_to_light = light_pos * 0.5 + 0.5;

                vec2 shadowTexCoord = vec2(
                    clamp(vertex_relative_to_light.x, 0.0, 1.0),
                    clamp(vertex_relative_to_light.y, 0.0, 1.0)
                );

                vec4 shadowmap_color1 = texture(shadow, vec2(shadowTexCoord.x, shadowTexCoord.y));
                float shadowmap_distance = shadowmap_color1.r;

                float bias = 0.00005;

                float illuminated = step(vertex_relative_to_light.z, shadowmap_distance + bias);

                vec3 norm = normalize(normal);
                float listDist = vertex_relative_to_light.z;

                if(illuminated < 1.0) {
                    finalColor.rgb *= shadowColor;
                } else {
                    finalColor.rgb *= lightColor;
                }
            }

            void main() {
                // albedo
                oFragColor = vec4(1.0);

                vec3 shadowColor = vec3(
                    50.0 / 255.0, // r
                    50.0 / 255.0, // g
                    75.0 / 255.0  // b
                );
                vec3 lightColor = vec3(
                    255.0 / 255.0, // r
                    240.0 / 255.0, // g
                    200.0 / 255.0  // b
                );

                Shading(oFragColor, vNormal.xyz, shadowColor, lightColor);
            }
        `;
    }

}