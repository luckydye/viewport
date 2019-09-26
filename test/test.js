import '../components/Viewport.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Resources } from '../src/Resources.js';
import Config from '../src/Config.js';
import { Geometry } from '../src/scene/Geometry.js';
import { Loader } from '../src/Loader.js';
import { Texture } from '../src/materials/Texture.js';
import { PlayerControler } from '../src/controlers/PlayerControler.js';
import { Plane } from '../src/geo/Plane.js';
import { ViewportController } from '../src/controlers/ViewportController.js';
import PrimitiveShader from '../src/shader/PrimitiveShader.js';
import { Cube } from '../src/geo/Cube.js';
import CompShader from '../src/shader/CompShader.js';

Config.global.load();
Config.global.save();

Resources.add({
    'sphere': 'models/sphere.obj',
    'tree': 'models/tree.obj',
}, false);

window.addEventListener('load', () => {
    const viewport = document.querySelector('gl-viewport');

    viewport.addEventListener('load', () => {
        init();
    });
})

function init() {
    const renderer = viewport.renderer;

    viewport.renderer.setResolution(240, 240);

    new ViewportController(viewport.camera, viewport);

    viewport.scene.add(new Geometry({
        material: new DefaultMaterial({
            diffuseColor: [0.4, 0.5, 1, 1]
        }),
        position: [0, 0, 0],
        vertecies: Loader.loadObjFile(Resources.get('sphere')),
        scale: 300
    }));

    genTrees();

    function genTrees() {

        const steps = 35;
        const scatter = 0.8;

        const treeamt = new DefaultMaterial({
            diffuseColor: [0.3, 1, 0.2, 1]
        });

        const verts = Loader.loadObjFile(Resources.get('tree'));

        for(let j = 0; j < Math.PI; j += Math.PI / steps)
        for(let i = 0; i < Math.PI; i += Math.PI / steps) {
            if(Math.random() > scatter) {
                tree(i, j);
            }
        }

        function tree(xa, ya) {
            viewport.scene.add(new Geometry({
                material: treeamt,
                position: [0, 0, 0],
                rotation: [xa * 2, 0, ya * 2],
                origin: [0, 600, 0],
                vertecies: verts,
                scale: 30
            }));
        }
    }

    setInterval(() => {
        const light = viewport.scene.lightSources;

        const a = performance.now() / 1000;
        const dist = 2000;

        light.position.x = (Math.sin(a) * dist) + viewport.scene.activeCamera.position.x;
        light.position.z = (Math.cos(a) * dist) + viewport.scene.activeCamera.position.z;
        light.position.y = -dist;
        light.rotation.y = -a + Math.PI;
    }, 16);
}
