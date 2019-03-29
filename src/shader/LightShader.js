import { Resources } from '../Resources.js';
import { GLShader } from '../graphics/GLShader.js';

Resources.add({
    'gbuffer.vs': require('../../res/shader/gbuffer.vertex.shader'),
    'light.fs': require('../../res/shader/light.fragment.shader'),
}, false);

export default class LightShader extends GLShader {

    static get source() {
        return [
            Resources.get('gbuffer.vs'),
            Resources.get('light.fs'),
        ]
    }

    get uniform() {
		return {
            uAmbientColor: this.ambient,
            shadowcolor: this.shadowcolor,
        };
	}
    
    constructor() {
        super({ name: "light" });

        this.ambient = [0.6, 0.6, 0.6];
        this.shadowcolor = 0.25;
    }
}