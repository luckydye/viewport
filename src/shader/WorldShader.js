import MeshShader from './MeshShader.js';

export default class WorldShader extends MeshShader {

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`
            void main() {
                oFragColor = vec4(normalize(vWorldPos.xyz), 1.0);
            }
        `;
    }

}