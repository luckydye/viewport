import { Renderer } from "../src/renderer/Renderer.js";
import { Resources } from "../src/Resources.js";
import { Scene } from "../src/scene/Scene.js";
import { Scheduler } from "../src/Scheduler.js";
import { Camera } from '../src/scene/Camera.js';
import { ViewportController } from '../src/controlers/ViewportController.js';

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
                    image-rendering: pixelated;
                    object-position: center;
                    object-fit: cover;
                }
            </style>
        `;
    }

    constructor() {
        super();

        this.scheduler = new Scheduler();

        this.attachShadow({ mode: 'open' });
        this.root = this.shadowRoot;

        this.canvas = document.createElement('canvas');

        this.frame = {
            currentFrame: 0,
            nextFrame: 0,
            lastFrame: 0,
            accumulator: 0,
            tickrate: 128
        };

        this.renderer = new Renderer(this.canvas);

        this.camera = new Camera({
            position: [0, 0, 0],
            fov: 90
        });

        this.scene = new Scene([ this.camera ]);

        new ViewportController(this.camera, this);
    }

    setScene(scene) {
        this.scene = scene;
        this.scene.add(this.camera);
    }

    connectedCallback() {

        this.root.innerHTML = this.constructor.template;
        this.root.appendChild(this.canvas);

        Resources.load().then(() => {
            this.init(this.canvas);
            this.render();
        });
    }

    render() {
        const currentFrame = performance.now();
        const delta = this.frame.lastFrame - this.frame.currentFrame;

        this.frame.accumulator += delta;
        if (this.frame.accumulator >= (1000 / this.frame.tickrate)) {
            this.frame.accumulator = 0;

            this.scene.update(delta);
            this.scheduler.run(delta);
        }
        this.renderer.draw(this.scene);

        this.frame.lastFrame = currentFrame;
        this.frame.nextFrame = requestAnimationFrame(this.render.bind(this));
    }

    init(canvas) {
        this.renderer.setResolution(this.clientWidth, this.clientHeight);

        window.addEventListener('resize', () => {
            this.renderer.setResolution(this.clientWidth, this.clientHeight);
        });

        this.dispatchEvent(new Event('load'));
    }

}

customElements.define('gl-viewport', Viewport);
