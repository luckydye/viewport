import { Resources } from '../Resources.js';
import { GLShader } from '../graphics/GLShader.js';

Resources.add({
    'reflection.vs': require('../../res/shader/reflection.vertex.shader'),
    'reflection.fs': require('../../res/shader/reflection.fragment.shader'),
}, false);

export default class ReflectionShader extends GLShader {

    static get source() {
        return [
            Resources.get('reflection.vs'),
            Resources.get('reflection.fs'),
        ]
    }
    
    constructor() {
        super({ name: "reflection" });
    }

}