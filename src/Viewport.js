import '../lib/gl-matrix.js';
import { Renderer } from "./gl/graphics/Renderer.js";
import { Scene } from "./gl/scene/Scene.js";
import { Vec } from "./gl/Math.js";
import { Camera } from "./gl/scene/Camera.js";
import { Material } from "./gl/graphics/Material.js";
import { Resources } from "./gl/Resources.js";
import { Terrain } from './gl/geo/Terrain.js';
import { CameraControler } from './gl/entity/CameraControler.js';
import { Importer } from './Importer.js';
import { Plane } from './gl/geo/Plane.js';
import { Logger } from './Logger.js';

Resources.add({
    'materials': './resources/materials/materials.json',
    'heightmap': './resources/textures/heightmap.png',
    'defaulttexture': './resources/textures/placeholder.png',
}, false);

const logger = new Logger('Viewport');

let nextFrame = 0, 
    lastFrame = 0, 
    accumulator = 0,
    tickrate = 128;

export default class Viewport extends HTMLElement {

    static get template() {
        return `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                canvas {
                    image-rendering: pixelated;
                    width: 100%;
                    height: 100%;
                }
            </style>
        `;
    }

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.root = this.shadowRoot;

        this.root.innerHTML = this.constructor.template;

        this.canvas = document.createElement('canvas');
        this.root.appendChild(this.canvas);

        this.lastFrame = {};
    }

    connectedCallback() {
        Resources.load().then(() => {
            logger.log("resources loaded");
            this.init(this.canvas);

            logger.log("resources initialized");
            this.render();

            thconsole.engiene.evaluate = function(str) {
                let viewport = this;
                let renderer = this.renderer;
                let gl = this.renderer.gl;
                return eval(str);
            }.bind(this)
        });
    }

    onRender() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        if (width != this.lastFrame.width ||
            height != this.lastFrame.height) {

            this.renderer.setResolution(width, height);
            this.renderer.updateViewport();
        }

        this.lastFrame.width = width;
        this.lastFrame.height = height;
    }

    render() {
        this.onRender();

        const currentFrame = performance.now();
        const delta = currentFrame - lastFrame;

        accumulator += delta;
        if(accumulator >= (1000 / tickrate)) {
            this.scene.update(delta);

            accumulator = 0;
        }
        this.renderer.draw();
        
        lastFrame = currentFrame;
        nextFrame = requestAnimationFrame(this.render.bind(this));
    }

    init(canvas) {
        const mats = Resources.get('materials');
        for(let name in mats) {
            Importer.importMatFromJson(name, mats[name]);
        }

        this.renderer = new Renderer(canvas);

        this.camera = new Camera({ 
            fov: 90,
            position: new Vec(0, 500, -3000),
            rotation: new Vec(25, 0, 0),
        });

        new CameraControler(this.camera, this.canvas);

        this.renderer.fogEnabled = true;

        this.createScene();
    }

    createScene() {
        this.scene = new Scene({
            camera: this.camera,
        });

        this.renderer.setScene(this.scene);

        this.scene.add(new Plane({
            material: Material.WATER,
            scale: 10000,
            rotation: new Vec(-90, 0, 0),
            position: new Vec(0, 10, 0)
        }));
    }

}

customElements.define('gl-viewport', Viewport);
