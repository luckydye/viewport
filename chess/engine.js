import '../components/Console.js';
import { Console } from '../components/Console.js';
import '../components/Viewport.js';
import Viewport from '../components/Viewport.js';
import MapFile from '../src/resources/MapFile.js';
import { Resources } from '../src/resources/Resources.js';
import { Camera } from '../src/scene/Camera.js';
import { PlayerEntity } from '../src/scene/PlayerEntity.js';
import { Task } from '../src/Scheduler.js';
import Follow from '../src/traits/Follow.js';
import { Platform } from './entities/Platform.js';
import Input from '../src/Input.js';

Resources.add({ 'testmap': "maps/test.gmap" });
Resources.load().then(() => init());

function init() {
    const viewport = new Viewport({ controllertype: null });
    document.body.appendChild(viewport);
    viewport.renderer.background = [107 / 255, 174 / 255, 239 / 255, 1];

    viewport.tabIndex = 0;
    Input.domElement = viewport;

    viewport.scheduler.addTask(new Task(ms => {
        viewport.scene.lightsource.position.x = viewport.camera.position.x;
    }));

    MapFile.OBJECT_TYPES["Platform"] = Platform;

    loadMap(viewport, Resources.get('testmap'));
}

function loadMap(viewport, resources) {
    const scene = resources.toScene();

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
}
