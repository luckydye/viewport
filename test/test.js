import '../components/Viewport.js';
import { ViewportController } from '../src/controlers/ViewportController.js';
import { Cube } from '../src/geo/Cube.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Texture } from '../src/materials/Texture.js';
import { Resources } from '../src/Resources.js';
import Config from '../src/Config.js';

Config.global.setValue('show.grid', true);

Resources.add({
    'placeholder.tex': 'textures/placeholder_256.png',
}, false);

window.addEventListener('DOMContentLoaded', () => {
    const viewport = document.querySelector('gl-viewport');

    viewport.addEventListener('load', () => {

        const controler = new ViewportController(viewport.camera, viewport);

        viewport.scene.add(new Cube({
            position: [0, 250, 0],
            rotation: [0.5, 0.5, 0],
            scale: 200,
            material: new DefaultMaterial({
                texture: new Texture(Resources.get('placeholder.tex'))
            }),
        }));
    })
})