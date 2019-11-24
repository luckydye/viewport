import MeshShader from './MeshShader.js';

export default class PrimitiveShader extends MeshShader {

    constructor() {
        super();

        this.drawmode = "LINES";
    }

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`
            void main () {
                oFragColor = vec4(vec3(primitiveColor), 1.0);
            }
        `;
    }
}
