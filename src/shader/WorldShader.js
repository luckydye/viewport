import MeshShader from './MeshShader.js';

export default class WorldShader extends MeshShader {

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`
            uniform SceneProjection scene;

            void main() {
                oFragColor = vec4(vec3(index), 1.0);
            }
        `;
    }

}