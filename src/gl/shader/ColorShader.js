import { Resources } from '../Resources.js';
import { GLShader } from '../graphics/GLShader.js';

Resources.add({
    'gbuffer.vs': './resources/shader/gbuffer.vertex.shader',
    'color.fs': './resources/shader/color.fragment.shader',
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