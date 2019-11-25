import '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import { PlayerControler } from '../src/controlers/PlayerControler.js';
import { Resources } from '../src/Resources.js';
import { Cube } from '../src/geo/Cube.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Plane } from '../src/geo/Plane.js';
import { Group } from '../src/geo/Group.js';

window.addEventListener('load', () => {

    const viewport = new Viewport({ controllertype: PlayerControler });
    document.body.appendChild(viewport);

    const geo = [
        new Cube({
            material: new DefaultMaterial(),
            position: [0, 2, 0],
            scale: 2
        }),
        new Cube({
            material: new DefaultMaterial(),
            position: [4, 2, 4],
            scale: 2
        }),
        new Plane({
            material: new DefaultMaterial(),
            position: [0, -0.1, 0],
            rotation: [-90 * Math.PI / 180, 0, 0],
            scale: 10
        })
    ];
    
    viewport.scene.add(geo);

    const group1 = new Group();
    const group2 = new Group();

    setTimeout(() => {
        group1.add(geo[0]);
        group1.add(geo[1]);
        group1.position.x -= 4;
        viewport.scene.add(group1);
    }, 1000);

    setTimeout(() => {
        group2.add(geo[0]);
        group2.add(geo[1]);
        group2.position.x -= 8;
        group2.scale = 2;
        viewport.scene.add(group2);
    }, 2216);

    viewport.enableCameraSaveState();

    setInterval(() => {

        geo[0].material.diffuseColor[0] = performance.now() / 1000 % 1;
        geo[0].material.diffuseColor[1] = performance.now() / 100 % 1;
        geo[0].material.update();

        geo[0].position.y = performance.now() / 1000 % 1 * 5;
        geo[0].update();

        geo[1].rotation.x = performance.now() / 1000 % 1 * 5;
        geo[1].update();

    }, 1000 / 60);
})
