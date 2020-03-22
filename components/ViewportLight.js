import Config from '../src/Config.js';
import { Cursor, RotationCursor } from '../src/geo/Cursor.js';
import { Renderer } from "../src/renderer/Renderer.js";
import { Resources } from "../src/resources/Resources.js";
import { Camera } from '../src/scene/Camera.js';
import { Scene } from "../src/scene/Scene.js";
import { Scheduler } from "../src/Scheduler.js";
import { Raycast, Vec } from '../src/Math.js';

export default class ViewportLight extends HTMLElement {

    static get template() {
        return `
            <style>
                :host {
                    display: block;
                }
                canvas {
                    display: block;
                }
            </style>
        `;
    }

    get width() {
        this._width = +this.getAttribute('width') || this._width;
        return this._width;
    }

    get height() {
        this._height = +this.getAttribute('height') || this._height;
        return this._height;
    }

    set width(val) {
        this._width = val;
    }

    set height(val) {
        this._height = val;
    }

    constructor(width, height) {
        super();

        this.width = width;
        this.height = height;

        this.scheduler = new Scheduler();

        this.attachShadow({ mode: 'open' });
        this.root = this.shadowRoot;

        this.canvas = document.createElement('canvas');

        // cursor stuff
        
        this.renderer = new Renderer(this.canvas);
        this.camera = new Camera({
            position: [0, 0, -20],
            rotation: [0, 0, 0],
            fov: 75
        });
        this.scene = new Scene([ this.camera ]);

        this.frame = {
            currentFrame: 0,
            nextFrame: 0,
            lastFrame: 0,
            accumulator: 0,
            tickrate: 1000 / 128
        };

        this.root.innerHTML = this.constructor.template;
        this.root.appendChild(this.canvas);
    }

    connectedCallback() {
        Resources.load().then(() => {
            this.init();
            this.render();
        });
    }

    disconnectedCallback() {
        if(this.frame.nextFrame) {
            cancelAnimationFrame(this.frame.nextFrame);
        }
    }

    setScene(scene) {
        this.scene = scene;
        this.scene.add(this.camera);
    }

    init() {
        // resolution
        this.renderer.setResolution(this.width, this.height);

        window.addEventListener('resize', () => {
            this.renderer.setResolution(this.width, this.height);
        });
    }

    render() {
        const currentFrame = performance.now();
        let delta = currentFrame - this.frame.lastFrame;
        
        this.frame.lastFrame = currentFrame;
        this.frame.nextFrame = requestAnimationFrame(this.render.bind(this));

        // dont update on inital render
        if(this.renderer.initialRender) {
            delta = 0;
        }

        // reset delta for the very first frame after initial load
        if(this.frame.accumulator == 0) {
            delta = this.frame.tickrate;
        }

        this.frame.accumulator += delta;

        this.renderer.info.drawtime = this.frame.accumulator.toFixed(1);

        while (this.frame.accumulator > this.frame.tickrate) {
            this.frame.accumulator -= this.frame.tickrate;

            this.scene.update(this.frame.tickrate);
            this.scheduler.run(this.frame.tickrate);
        }
        
        this.renderer.draw(this.scene, {
            camera: this.camera,
        });

        this.renderer.info.cputime = this.frame.accumulator.toFixed(1);
        this.renderer.info.fps = Math.round(1000 / delta);
    }

}

customElements.define('gyro-canvas', ViewportLight);
