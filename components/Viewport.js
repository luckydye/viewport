import { Loader } from '../src/Loader.js';
import { Logger } from '../src/Logger.js';
import { Renderer } from "../src/renderer/Renderer";
import { Resources } from "../src/Resources.js";
import { Scene } from "../src/scene/Scene.js";
import { Vec, Raycast } from "../src/Math";
import { Scheduler } from "../src/Scheduler";
import { CursorControler } from "../src/controlers/CursorController";
import { CameraControler } from "../src/controlers/CameraControler";
import { Camera } from '../src/scene/Camera.js';
import { Cubemap } from '../src/materials/Cubemap.js';
import { Cube } from '../src/geo/Cube.js';
import { ViewportController } from '../src/controlers/ViewportController.js';

const logger = new Logger('Viewport');

let nextFrame = 0,
    lastFrame = 0,
    accumulator = 0,
    tickrate = 128;

export default class Viewport extends HTMLElement {

    get frameRate() {
        return 1000 / this.renderer.frameTime;
    }

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
                .item {
                    width: 50px;
                    height: 50px;
                    background: grey;
                    border-radius: 20%;
                    position: relative;
                    color: white;
                    font-family: sans-serif;
                    font-size: 14px;
                    margin: 0 15px 25px 0;
                }
                .spacer {
                    width: 1px;
                    height: 50px;
                    background: grey;
                    margin: 0 15px 25px 0;
                }
                .item::after {
                    content: attr(geo);
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-top: 5px;
                    transform: translateX(-50%);
                    opacity: 0.75;
                }
                .item:hover:before {
                    content: "";
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    right: -5px;
                    bottom: -25px;
                    background: white;
                    opacity: 0.125;
                }
            </style>
        `;
    }

    constructor() {
        super();

        this.scheduler = new Scheduler();

        this.attachShadow({ mode: 'open' });
        this.root = this.shadowRoot;

        this.root.innerHTML = this.constructor.template;

        this.canvas = document.createElement('canvas');
        this.root.appendChild(this.canvas);

        this.lastFrame = {};
    }

    connectedCallback() {
        Resources.load().then(() => {
            this.init(this.canvas);

            logger.log("resources initialized");
            this.render();
        });
    }

    render() {
        const currentFrame = performance.now();
        const delta = currentFrame - lastFrame;

        accumulator += delta;
        if (accumulator >= (1000 / tickrate)) {
            accumulator = 0;

            this.scheduler.run(delta);
            this.scene.update(delta);
        }
        this.renderer.draw();

        lastFrame = currentFrame;
        nextFrame = requestAnimationFrame(this.render.bind(this));
    }

    init(canvas) {

        this.camera = new Camera({
            fov: 90,
        });

        this.scene = new Scene(this.camera);

        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        this.renderer.setResolution(window.innerWidth, window.innerHeight);
        this.renderer.updateViewport();

        const controler = new ViewportController(this.camera, this);

        const cube = new Cube({
            position: new Vec(0, 500, 0),
            rotation: new Vec(0.5, 0.5, 0),
            scale: 200,
        });

        this.scene.add(cube);

        this.dispatchEvent(new Event('load'));
    }

}

customElements.define('gl-viewport', Viewport);
