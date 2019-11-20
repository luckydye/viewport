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

        const geo = [
            new Cube({
                material: new DefaultMaterial({
                    diffuseColor: [1, 1, 1, 1],
                    texture: new Texture(img)
                }),
                position: [0, 2, 0],
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

        const viewport = new Viewport();
        document.body.appendChild(viewport);
        
        viewport.scene.add(geo);

        viewport.renderer.debug = true;
    })
})
