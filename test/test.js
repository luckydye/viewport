import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import Config from '../src/Config.js';
import { Cube } from '../src/geo/Cube.js';
import { Plane } from '../src/geo/Plane.js';
import { Loader } from '../src/Loader.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Resources } from '../src/Resources.js';
import { Texture } from '../src/materials/Texture.js';

Config.global.load();
Config.global.save();

const img = new Image();
img.src = "./image.jpg";

window.addEventListener('load', () => {
    Resources.load().then(() => {

        const sh = new DefaultMaterial({
            diffuseColor: [1, 1, 1, 1],
            // texture: new Texture(img)
        });

        const geo = [
            new Cube({
                material: sh,
                position: [0, 2, 0],
                vertecies: Loader.loadObjFile(Resources.get('tree')),
                scale: 2
            }),
            new Cube({
                material: sh,
                position: [4, 2, 4],
                vertecies: Loader.loadObjFile(Resources.get('tree')),
                scale: 2
            }),
            new Plane({
                material: new DefaultMaterial({
                    diffuseColor: [0.4, 0.65, 0.4, 1]
                }),
                position: [0, -0.01, 0],
                rotation: [-Math.PI / 2, 0, 0],
                scale: 10
            })
        ];

        setInterval(() => {

            geo[0].material.diffuseColor[0] = performance.now() / 1000 % 1;
            geo[0].material.diffuseColor[1] = performance.now() / 100 % 1;
            geo[0].material.update();

            geo[0].position.y = performance.now() / 1000 % 1 * 5;
            geo[0].update();

            geo[1].rotation.x = performance.now() / 1000 % 1 * 5;
            geo[1].update();

        }, 1000 / 15);

        const viewport = new Viewport();
        document.body.appendChild(viewport);
        
        viewport.scene.add(geo);
    })
})
