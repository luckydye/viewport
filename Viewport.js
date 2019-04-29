import { Loader } from './src/Loader.js';
import { Logger } from './src/Logger.js';
import { Renderer } from "./src/renderer/Renderer";
import { Resources } from "./src/Resources.js";
import { Scene } from "./src/scene/Scene.js";
import { Vec } from "./src/Math";
import { Scheduler } from "./src/Scheduler";
import { CursorControler } from "./src/controlers/CursorController";
import { CameraControler } from "./src/controlers/CameraControler";
import { Camera } from './src/scene/Camera.js';

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
            </style>
        `;
    }

    scheduler = new Scheduler();

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
            accumulator = 0;
            
            this.scheduler.run(delta);
            this.scene.update(delta);
        }
        this.renderer.draw();
        
        lastFrame = currentFrame;
        nextFrame = requestAnimationFrame(this.render.bind(this));
    }

    init(canvas) {
        const mats = Resources.get('materials');
        for(let name in mats) {
            Loader.createMatFromJson(name, mats[name]);
        }

        this.camera = new Camera({ 
            fov: 90,
            position: new Vec(0, -400, -2500),
            rotation: new Vec(15, 0, 0),
        })

        this.scene = new Scene(this.camera);

        this.renderer = new Renderer(canvas);
        this.renderer.setScene(this.scene);

        const controler = new CameraControler(this.scene.activeCamera, canvas);
        const cursorControler = new CursorControler(this.scene.curosr, this);

        cursorControler.interaction = objID => {
            if(objID != 0) {
                controler.lock();
            } else {
                controler.unlock();
            }
        }

        this.dispatchEvent(new Event('load'));

        this.setCursor([...this.scene.objects][this.scene.objects.size-1]);
    }

    setCursor(obj) {
        if(obj) {
            this.scene.curosr.hidden = false;
            this.scene.curosr.position = new Vec(obj.position);
            obj.position = this.scene.curosr.position;
        } else {
            this.scene.curosr.hidden = true;
        }
    }

}

customElements.define('gl-viewport', Viewport);

module.exports = Viewport;
