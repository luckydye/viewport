import MeshShader from './MeshShader.js';

export default class NormalShader extends MeshShader {

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`
            void main() {
                oFragColor = vec4(normalize(vNormal * 100.0 + 1.0), 1.0);
            }
        `;
    }

}