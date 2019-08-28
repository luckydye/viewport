import '../components/Viewport.js';
import { ViewportController } from '../src/controlers/ViewportController';
import { Cube } from '../src/geo/Cube';
import DefaultMaterial from '../src/materials/DefaultMaterial';
import { Texture } from '../src/materials/Texture';
import { Resources } from '../src/Resources';

Resources.add({
    'placeholder.tex': 'textures/placeholder_256.png',
}, false);

window.addEventListener('DOMContentLoaded', () => {
    const viewport = document.querySelector('gl-viewport');

    viewport.addEventListener('load', () => {

        viewport.renderer.showGrid = true;

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