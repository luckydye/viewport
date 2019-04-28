import { Resources } from '../Resources.js';
import { GLShader } from './GLShader.js';

Resources.add({
    'gbuffer.vs': require('../../res/shader/gbuffer.vertex.shader'),
    'light.fs': require('../../res/shader/light.fragment.shader'),
}, false);

export default class LightShader extends GLShader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return Resources.get('light.fs');
    }

    uniform = {
        ambientcolor: [0.5, 0.5, 0.5],
        shadowcolor: 0.15,
    }
    
}