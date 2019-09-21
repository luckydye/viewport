import MeshShader from './MeshShader.js';

export default class LightShader extends MeshShader {

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`

            uniform Material material;

            void main() {
                vec4 spec = texture(material.specularMap, vTexCoords);

                if(spec.r > 0.75) {
                    oFragColor = vec4(vec3(1.0), 1.0);
                } else {
                    oFragColor = vec4(vec3(0.0), 1.0);
                }
            }
        `;
    }

}