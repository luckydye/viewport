import '../components/Console.js';
import { Console } from '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import { Emitter } from '../src/geo/Emitter.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import MattMaterial from '../src/materials/MattMaterial.js';
import MapFile from '../src/resources/MapFile.js';
import { Resources } from '../src/resources/Resources.js';
import { Camera } from '../src/scene/Camera.js';
import { Geometry } from '../src/scene/Geometry.js';
import { PlayerEntity } from '../src/scene/PlayerEntity.js';
import { Task } from '../src/Scheduler.js';
import Follow from '../src/traits/Follow.js';
import { Platform } from './entities/Platform.js';
import { Texture } from '../src/materials/Texture.js';

window.addEventListener('DOMContentLoaded', () => {
    Resources.load().then(() => init());
});

Resources.add({
    'teapot': "models/teapot.obj",
    'ground': "models/ground.obj",
    'grass': "textures/grass.png",
});

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [107 / 255, 174 / 255, 239 / 255, 1];

    let ground = Resources.get('ground');
    ground = ground.getVertecies();

    let teapot = Resources.get('teapot');
    teapot = teapot.getVertecies();
    
    const geo = [
        new PlayerEntity({
            vertecies: teapot,
        }),
        new Geometry({
            material: new DefaultMaterial({
                texture: new Texture(Resources.get('grass')),
            }),
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
        new Emitter({
            material: new DefaultMaterial(),
            position: [0, 12, 0],
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

    viewport.scheduler.addTask(new Task(ms => {
        viewport.scene.lightsource.position.x = camera.position.x;
    }));

    exportable(viewport);
}

function exportable(viewport) {
    Console.GLOBAL_COMMANDS["export"] = async () => {

        MapFile.OBJECT_TYPES["Platform"] = Platform;

        const blob = await MapFile.serializeScene(viewport.scene);
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "export.gmap";
        link.click();
        
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
