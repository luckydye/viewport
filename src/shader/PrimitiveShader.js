import MeshShader from './MeshShader.js';

export default class PrimitiveShader extends MeshShader {

    constructor() {
        super();

        this.drawmode = "LINE_STRIP";
    }

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`
            void main () {
                oFragColor = vec4(primitiveColor, 1.0);
            }
        `;
    }
}
