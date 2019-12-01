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
import { Platform } from './entities/Platform.js';

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
        new Platform({
            material: new DefaultMaterial(),
            hitbox: [1.55, 7.5, -1.5, -7.5, 1],
            vertecies: ground,
            position: [20, -3, 0.25],
            rotation: [0, 0, 0],
            scale: 1.5
        })
    ];

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

    exportable(viewport);
}

function exportable(viewport) {
    Console.GLOBAL_COMMANDS["export"] = () => {

        MapFile.OBJECT_TYPES["PlayerEntity"] = PlayerEntity;
        MapFile.OBJECT_TYPES["Platform"] = Platform;

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

            const camera = new Camera({
                fov: 54.4,
                traits: [ Follow ]
            });
        
            camera.position.z = -20;
            camera.position.y = -2;
            camera.origin.y = -4;
        
            camera.follow([...scene.objects].find(o => o instanceof PlayerEntity));

            scene.add(camera);

            viewport.camera = camera;
            viewport.scene = scene;
        })
    }
}
