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

Config.global.load();
Config.global.save();

Resources.add({
    'model': 'models/teapot.obj',
    'albedo': 'textures/TexturesCom_Scifi_Panel_2K_albedo.png',
    'normal': 'textures/TexturesCom_Scifi_Panel_2K_normal.png',
    'spec': 'textures/TexturesCom_Scifi_Panel_2K_roughness.png',
}, false);

window.addEventListener('load', () => {
    const viewport = document.querySelector('gl-viewport');

    viewport.addEventListener('load', init);

    init();

    function init() {
        viewport.renderer.setResolution(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', () => {
            viewport.renderer.setResolution(window.innerWidth, window.innerHeight);
        })

        new PlayerControler(viewport.camera, viewport);

        const teapot = new Geometry({
            position: [0, 0, 0],
            origin: [0, -100, 0],
            vertecies: Loader.loadObjFile(Resources.get('model')),
            scale: 50,
            material: new DefaultMaterial({
                specularMap: new Texture(Resources.get('spec')),
                normalMap: new Texture(Resources.get('normal')),
                texture: new Texture(Resources.get('albedo')),
            })
        });

        viewport.scene.add(teapot);

        viewport.scene.add(new Plane({
            rotation: [90 * Math.PI / 180, 0, 0],
            scale: 1000,
            material: new DefaultMaterial({
                diffuseColor: [0.4, 0.4, 0.4, 1.0],
                specular: 0,
            }),
        }));

        setInterval(() => {
            teapot.rotation.y = performance.now() / 3000.0;
            // teapot.rotation.x = performance.now() / 3000.0;
        }, 16);
    }
})