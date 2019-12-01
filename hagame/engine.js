import '../components/Console.js';
import { Console } from '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import MapFile from '../src/resources/MapFile.js';
import { Resources } from '../src/resources/Resources.js';
import { Camera } from '../src/scene/Camera.js';
import { Entity } from '../src/scene/Entity.js';
import { Geometry } from '../src/scene/Geometry.js';
import Follow from '../src/traits/Follow.js';
import { PlayerEntity } from './entities/Player.js';

window.addEventListener('DOMContentLoaded', () => {
    Resources.load().then(() => init());
});

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [107 / 255, 174 / 255, 239 / 255, 1];

    const ground = Resources.get('ground').getVertecies();
    
    const geo = [
        new PlayerEntity(),
        new Geometry({
            material: new DefaultMaterial(),
            hitbox: [2.25, 9.2, -1.5, -9.2, 2],
            vertecies: ground,
            position: [0, -1, 0],
            rotation: [0, 0, 0],
            scale: 2
        }),
        new Geometry({
            material: new DefaultMaterial(),
            hitbox: [2.25, 9.2, -1.5, -9.2, 2],
            vertecies: ground,
            position: [-18, -3, 1],
            rotation: [0, 0, 0],
            scale: 2
        }),
        new Entity({
            material: new DefaultMaterial(),
            hitbox: [1.55, 7.5, -1.5, -7.5, 1],
            vertecies: ground,
            position: [20, -3, 0.25],
            rotation: [0, 0, 0],
            scale: 1.5
        })
    ];

    setInterval(() => {
        geo[3].velocity.x = Math.sin(performance.now() / 500) * 0.1;
    }, 14);

    const camera = new Camera({
        fov: 54.4,
        traits: [ Follow ]
    });

    camera.position.z = -20;
    camera.position.y = -2;
    camera.origin.y = -4;

    viewport.camera = camera;

    viewport.scene.add(camera);
    viewport.scene.add(geo);

    camera.follow(geo[0]);

    Console.GLOBAL_COMMANDS["export"] = () => {

        MapFile.OBJECT_TYPES["PlayerEntity"] = PlayerEntity;

        const blob = MapFile.serializeScene(viewport.scene);
        const blobUrl = URL.createObjectURL(blob);

        // const link = document.createElement("a");
        // link.href = blobUrl;
        // link.download = "export.gmap";
        // link.click();
        
        blob.arrayBuffer().then(b => {
            const file = MapFile.fromDataArray(b);
            console.log(file);
            const scene = file.toScene();

            console.log(scene);

            viewport.scene = scene;
            viewport.scene.add(viewport.camera);
        })
    }
}
