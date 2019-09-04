import '../components/Viewport.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Resources } from '../src/Resources.js';
import Config from '../src/Config.js';
import { Geometry } from '../src/scene/Geometry.js';
import { Loader } from '../src/Loader.js';
import { Texture } from '../src/materials/Texture.js';
import { PlayerControler } from '../src/controlers/PlayerControler.js';

Config.global.load();
Config.global.save();

Resources.add({
    'sphere': 'models/sphere.obj',
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

        viewport.scene.add(new Geometry({
            vertecies: Loader.loadObjFile(Resources.get('sphere')),
            scale: 200,
            material: new DefaultMaterial({
                specularMap: new Texture(Resources.get('spec')),
                normalMap: new Texture(Resources.get('normal')),
                texture: new Texture(Resources.get('albedo')),
            }),
        }));
    }
})