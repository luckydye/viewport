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
import PrimitiveShader from '../src/shader/PrimitiveShader.js';
import { Cube } from '../src/geo/Cube.js';

Config.global.load();
Config.global.save();

Resources.add({
    'model': 'models/teapot.obj',
    'albedo': 'textures/TexturesCom_Scifi_Panel_2K_albedo.png',
    'normal': 'textures/TexturesCom_Scifi_Panel_2K_normal.png',
    'spec': 'textures/TexturesCom_Scifi_Panel_2K_roughness.png',
    'paper': 'textures/paper.png',
}, false);

window.addEventListener('load', () => {
    const viewport = document.querySelector('gl-viewport');
    init();
})

function init() {

    const paperTexture = new Texture(Resources.get('paper'));
    const noiseTexture = new Texture(Resources.get('paper'));

    const renderer = viewport.renderer;

    console.log(viewport, viewport.renderer);

    viewport.renderer.setResolution(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
        viewport.renderer.setResolution(window.innerWidth, window.innerHeight);
    })

    viewport.renderer.preComposition = () => {
        renderer.prepareTexture(paperTexture);
        renderer.pushTexture(paperTexture.gltexture, 'paperTexture');
        renderer.prepareTexture(noiseTexture);
        renderer.pushTexture(noiseTexture.gltexture, 'noiseTexture');
    }

    new PlayerControler(viewport.camera, viewport);

    viewport.camera.fov = 45;
    viewport.camera.position.z = -800;

    const teapot = new Geometry({
        origin: [0, -200, 0],
        vertecies: Loader.loadObjFile(Resources.get('model')),
        scale: 50,
        material: new DefaultMaterial({
            shader: new PrimitiveShader(),
            specularMap: new Texture(Resources.get('spec')),
            normalMap: new Texture(Resources.get('normal')),
            texture: new Texture(Resources.get('albedo')),
        })
    });

    viewport.scene.add(teapot);

    setInterval(() => {
        teapot.rotation.y = performance.now() / 3000.0;
        teapot.rotation.z = performance.now() / 6000.0;
        teapot.rotation.x = performance.now() / 12000.0;
    }, 16);
}