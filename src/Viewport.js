import { Renderer } from "./graphics/Renderer.js";
import { Scene } from "./scene/Scene.js";
import { Vec } from "./Math.js";
import { Camera } from "./scene/Camera.js";
import { Resources } from "./Resources.js";
import { CameraControler } from './entity/CameraControler.js';
import { Importer } from './Importer.js';
import { Logger } from './Logger.js';

const logger = new Logger('Viewport');

const materials = {
    "HEIGHT": {
        "receiveShadows": true,
        "castShadows": true
    },
    "LIGHT": {
        "receiveShadows": true,
        "castShadows": true
    },
    "PRIMITIVE": {
        "diffuseColor": [1, 1, 1],
        "receiveShadows": false,
        "castShadows": false
    },
    "WATER": {
        "diffuseColor": [0.15, 0.15, 0.15],
        "receiveShadows": true,
        "castShadows": true,
        "transparency": 0.125
    }
};

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

    init() {
        const mats = materials || Resources.get('materials');
        for(let name in mats) {
            Importer.createMatFromJson(name, mats[name]);
        }

        this.renderer = new Renderer(this.canvas);

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
    }

}

customElements.define('gl-viewport', Viewport);
