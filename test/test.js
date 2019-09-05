import '../components/Viewport.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Resources } from '../src/Resources.js';
import Config from '../src/Config.js';
import { Geometry } from '../src/scene/Geometry.js';
import { Loader } from '../src/Loader.js';
import { Texture } from '../src/materials/Texture.js';
import { PlayerControler } from '../src/controlers/PlayerControler.js';
import { Plane } from '../src/geo/Plane.js';

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

        setInterval(() => {
            viewport.renderer.lightDirection[0] += Math.sin(performance.now() / 500.0) * 1500.0;
            viewport.renderer.lightDirection[2] += Math.cos(performance.now() / 500.0) * 1500.0;
        }, 16);

        new PlayerControler(viewport.camera, viewport);

        const mat1 = new DefaultMaterial({
            specularMap: new Texture(Resources.get('spec')),
            normalMap: new Texture(Resources.get('normal')),
            texture: new Texture(Resources.get('albedo')),
        });

        const mat2 = new DefaultMaterial();

        viewport.scene.add(new Geometry({
            vertecies: Loader.loadObjFile(Resources.get('model')),
            scale: 200,
            material: mat1
        }));

        viewport.scene.add(new Plane({
            rotation: [90 * Math.PI / 180, 0, 0],
            scale: 2000,
            material: mat2,
        }));

        viewport.scene.add(new Plane({
            rotation: [43 * Math.PI / 180, 0, 0],
            position: [0, 1200, 3200],
            scale: 2000,
            material: mat2,
        }));
    }
})