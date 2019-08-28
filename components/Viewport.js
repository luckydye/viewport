import { Logger } from '../src/Logger.js';
import { Renderer } from "../src/renderer/Renderer";
import { Resources } from "../src/Resources.js";
import { Scene } from "../src/scene/Scene.js";
import { Scheduler } from "../src/Scheduler";
import { Camera } from '../src/scene/Camera.js';

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
                    display: block;
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

        this.renderer.setResolution(this.clientWidth, this.clientHeight);

        window.addEventListener('resize', () => {
            this.renderer.setResolution(this.clientWidth, this.clientHeight);
        })

        this.dispatchEvent(new Event('load'));
    }

}

customElements.define('gl-viewport', Viewport);
