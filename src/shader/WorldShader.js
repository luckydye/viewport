import MeshShader from './MeshShader.js';

export default class WorldShader extends MeshShader {

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`
            uniform SceneProjection scene;

            void main() {
                vec4 diff = (vec4(1.0) * scene.model) - vec4(vViewPos, 1.0);
                oFragColor = vec4(diff.xyz, 1.0);
            }
        `;
    }

}