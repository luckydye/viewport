import { Resources } from '../Resources.js';
import { GLShader } from '../renderer/GLShader.js';

Resources.add({
    'gbuffer.vs': require('../../res/shader/gbuffer.vertex.shader'),
    'color.fs': require('../../res/shader/color.fragment.shader'),
}, false);

export default class ColorShader extends GLShader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return Resources.get('color.fs');
    }

}