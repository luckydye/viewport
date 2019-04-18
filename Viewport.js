import { FirstPersonCamera } from "./src/camera/FirstPersonCamera";
import { FirstPersonControler } from "./src/controlers/FirstPersonControler";
import { Guide } from "./src/geo/Guide";
import { Importer } from './src/Importer.js';
import { Logger } from './src/Logger.js';
import { Raycast, Vec } from "./src/Math.js";
import { Renderer } from "./src/renderer/Renderer";
import { Resources } from "./src/Resources.js";
import { Scene } from "./src/scene/Scene.js";

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
                }
                canvas {
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

    init(canvas) {
        const mats = Resources.get('materials');
        for(let name in mats) {
            Importer.createMatFromJson(name, mats[name]);
        }

        this.renderer = new Renderer(canvas);

        this.camera = new FirstPersonCamera({ 
            fov: 90,
            position: new Vec(0, -400, -2500),
            rotation: new Vec(15, 0, 0),
        });

        new FirstPersonControler(this.camera, canvas);

        canvas.addEventListener('click', e => {
            // define ground plane
            const plane = new Vec(0, 0, 0);
            const normal = new Vec(0, 1, 0);

            // ray
            const ray = new Raycast(this.camera, e.x, e.y);
            const hit = ray.hit(plane, normal);

            if(hit) {
                this.scene.add(new Guide({
                    position: hit.position
                }));
            }
        })

        this.createScene();

        this.dispatchEvent(new Event('load'));
    }

    createScene() {
        const scene = new Scene({
            camera: this.camera,
        });

        this.scene = scene;
        this.renderer.setScene(scene);

        return scene;
    }

}

customElements.define('gl-viewport', Viewport);

module.exports = Viewport;
