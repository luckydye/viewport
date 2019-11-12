import MeshShader from './MeshShader.js';

export default class IndexShader extends MeshShader {

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`
            void main() {
                oFragColor = vec4(vec3(index), 1.0);
            }
        `;
    }

}