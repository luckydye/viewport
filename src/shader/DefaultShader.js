import { Resources } from '../Resources.js';
import { Shader } from '../renderer/RendererShader.js';

import DefaultFragShader from './Default.shader.glsl';

Resources.add({
    'gbuffer.vs': 'shader/gbuffer.vertex.shader',
}, false);

export default class DefaultShader extends Shader {

    static vertexSource() {
        return Resources.get('gbuffer.vs');
    }

    static fragmentSource() {
        return DefaultFragShader;
    }

}