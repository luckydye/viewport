import '../components/Viewport.js';
import { ViewportController } from '../src/controlers/ViewportController.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Resources } from '../src/Resources.js';
import Config from '../src/Config.js';
import { Geometry } from '../src/scene/Geometry.js';
import { Loader } from '../src/Loader.js';

Config.global.setValue('show.grid', false);

Resources.add({
    'sphere': 'models/sphere.obj',
}, false);

window.addEventListener('load', () => {
    const viewport = document.querySelector('gl-viewport');

    viewport.addEventListener('load', () => {

        viewport.renderer.setResolution(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', () => {
            viewport.renderer.setResolution(window.innerWidth, window.innerHeight);
        })

        new ViewportController(viewport.camera, viewport);

        viewport.scene.add(new Geometry({
            vertecies: Loader.loadObjFile(Resources.get('sphere')),
            scale: 800,
            material: new DefaultMaterial({
                diffuseColor: [1.0, 141 / 255, 0.0, 1.0]
            }),
        }));
    })
})