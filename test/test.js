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
import CompShader from '../src/shader/CompShader.js';

Config.global.load();
Config.global.save();

Resources.add({
    'model': 'models/cube_.obj',
    'albedo': 'textures/TexturesCom_Scifi_Panel_2K_albedo.png',
    'normal': 'textures/TexturesCom_Scifi_Panel_2K_normal.png',
    'spec': 'textures/TexturesCom_Scifi_Panel_2K_roughness.png',
    'paper': 'textures/paper.png',
    'noise': 'textures/noise.jpg',
    'noise2': 'textures/noise2.jpg',
}, false);

class LineShader extends PrimitiveShader {
    constructor() {
        super();

        this.drawmode = "POINTS";
    }
}

CompShader.fragmentSource = () => {
    return `#version 300 es

    precision mediump float;
    
    in vec2 vTexCoords;
    in mat4 vShadowCoords;
    
    struct SceneProjection {
        mat4 model;
        mat4 view;
        mat4 projection;
    };
    uniform SceneProjection scene;
    
    uniform sampler2D colorBuffer;
    uniform sampler2D depthBuffer;
    uniform sampler2D paperTexture;
    uniform sampler2D noiseTexture;
    uniform sampler2D noiseTexture2;

    out vec4 oFragColor;

    vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3846153846) * direction;
        vec2 off2 = vec2(3.2307692308) * direction;
        color += texture(image, uv) * 0.2270270270;
        color += texture(image, uv + (off1 / resolution)) * 0.3162162162;
        color += texture(image, uv - (off1 / resolution)) * 0.3162162162;
        color += texture(image, uv + (off2 / resolution)) * 0.0702702703;
        color += texture(image, uv - (off2 / resolution)) * 0.0702702703;
        return color;
    }
    
    void main() {
        vec4 paper = texture(paperTexture, vTexCoords);

        vec2 tex = vTexCoords;

        tex.y += ((paper.r - 0.5) * 0.125) - (0.125 * 0.5);
        tex.x += ((paper.r - 0.5) * 0.025) - (0.025 * 0.5);

        vec4 color1 = blur9(colorBuffer, tex, vec2(1920.0), vec2(1.0, 0.0));
        vec4 color2 = blur9(colorBuffer, tex, vec2(1080.0), vec2(0.0, 1.0));
        
        oFragColor = paper;

        vec4 color;

        if(color1.a > 0.0 || color2.a > 0.0) {
            color.rgb -= color1.g * 0.65;
            color.rgb -= color2.g * 0.65;
            color.rgb -= texture(noiseTexture, vTexCoords * paper.r * 10.0).r + 0.33;
            color.rgb *= pow(texture(paperTexture, vTexCoords).r, 10.0);
            color += 0.25;
        }

        oFragColor += color;
    }`;
}

window.addEventListener('load', () => {
    const viewport = document.querySelector('gl-viewport');
    init();
})

function init() {

    const paperTexture = new Texture(Resources.get('paper'));
    const noiseTexture = new Texture(Resources.get('noise'));
    const noiseTexture2 = new Texture(Resources.get('noise2'));

    const renderer = viewport.renderer;

    viewport.renderer.setResolution(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
        viewport.renderer.setResolution(window.innerWidth, window.innerHeight);
    })

    viewport.renderer.preComposition = () => {
        renderer.prepareTexture(paperTexture);
        renderer.pushTexture(paperTexture.gltexture, 'paperTexture');
        renderer.prepareTexture(noiseTexture);
        renderer.pushTexture(noiseTexture.gltexture, 'noiseTexture');
        renderer.prepareTexture(noiseTexture2);
        renderer.pushTexture(noiseTexture2.gltexture, 'noiseTexture2');
    }

    new PlayerControler(viewport.camera, viewport);

    viewport.camera.fov = 45;
    viewport.camera.position.z = -800;

    const vertecies = Loader.loadObjFile(Resources.get('model'));
    const material = new DefaultMaterial({
        shader: new LineShader(),
        specularMap: new Texture(Resources.get('spec')),
        normalMap: new Texture(Resources.get('normal')),
        texture: new Texture(Resources.get('albedo')),
    });

    const geo = [
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
        new Geometry({ vertecies, material }),
    ];

    viewport.scene.add(geo);

    setInterval(() => {
        const t = performance.now();

        for (let i = 0; i < geo.length; i++) {
            const g = geo[i];

            const index = performance.now() + (i * 500.0);

            g.scale = i * (10 + Math.sin(t / 1000));

            g.rotation.y = index / 3000.0;
            g.rotation.z = index / 6000.0;
            g.rotation.x = index / 12000.0;
        }
    }, 1000 / 24);
}
