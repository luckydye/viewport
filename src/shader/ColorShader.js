import { Resources } from '../Resources.js';
import { GLShader } from './GLShader.js';

Resources.add({
    'gbuffer.vs': require('../../res/shader/gbuffer.vertex.shader'),
    'color.fs': require('../../res/shader/color.fragment.shader'),
}, false);

export default class ColorShader extends GLShader {

    static get source() {
        return [
            Resources.get('gbuffer.vs'),
            Resources.get('color.fs'),
        ]
    }
    
    constructor() {
        super({ name: "color" });
    }

}