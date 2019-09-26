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
import Viewport from '../components/Viewport.js';
import { Scene } from '../src/scene/Scene.js';
import { Camera } from '../src/scene/Camera.js';

Config.global.load();
Config.global.save();

Resources.add({
    'sphere': 'models/sphere.obj',
    'tree': 'models/tree.obj',
}, false);

window.addEventListener('load', () => {
    Resources.load().then(() => {

        const geo = [
            new Geometry({
                material: new DefaultMaterial({
                    diffuseColor: [0.4, 0.65, 0.4, 1]
                }),
                position: [0, 400, 0],
                vertecies: Loader.loadObjFile(Resources.get('sphere')),
                scale: 100
            }),
            new Plane({
                material: new DefaultMaterial({
                    diffuseColor: [0.4, 0.65, 0.4, 1]
                }),
                position: [0, -30, 0],
                rotation: [Math.PI / 2, 0, 0],
                scale: 2000
            })
        ];

        const scene = createScene(geo);

        {
            const viewport = new Viewport();
            document.body.appendChild(viewport);
            viewport.setScene(scene);

            viewport.camera.position.y = -400;
        }
        {
            const viewport = new Viewport();
            document.body.appendChild(viewport);
            viewport.setScene(scene);
            
            viewport.camera.position.y = -400;
        }
    })
})

function createScene(geo) {

    const scene = new Scene();

    scene.add(geo);

    genTrees();

    function genTrees() {

        const steps = 30;
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
            scene.add(new Geometry({
                material: treeamt,
                position: [0, 400, 0],
                rotation: [xa * 2, 0, ya * 2],
                origin: [0, 180, 0],
                vertecies: verts,
                scale: 15
            }));
        }
    }

    return scene;
}
