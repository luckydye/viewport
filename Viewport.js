import { Camera } from "./src/camera/Camera";
import { CameraControler } from './src/controlers/CameraControler';
import { Importer } from './src/Importer.js';
import { Logger } from './src/Logger.js';
import { Vec, RayCast } from "./src/Math.js";
import { Renderer } from "./src/renderer/Renderer";
import { Resources } from "./src/Resources.js";
import { Scene } from "./src/scene/Scene.js";
import { Cube } from "./src/geo/Cube";
import TestMaterial from "./src/materials/TestMaterial";
import { FirstPersonControler } from "./src/controlers/FirstPersonControler";
import { FirstPersonCamera } from "./src/camera/FirstPersonCamera";
import { Guide } from "./src/geo/Guide";
import { vec2 } from "gl-matrix";
import { Vector } from "./src/geo/Vector";

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
            const {x, y} = e;

            // plane
            const p0 = new Vec(0, 0, 0);
            const n = new Vec(0, 1, 0);

            // ray
            const cam = this.camera.position;
            const l0 = new Vec(cam.x, cam.y, cam.z);
            const l = new RayCast(this.camera, x, y);

            const denom = n.dot(l);
            if(denom > 0) {
                // normal distance
                const p0l0 = p0.subtract(l0);

                const t = p0l0.dot(n);

                if(t >= 0) {

                    const position = l.multiply(new Vec(t, t, t)).add(l0);

                    const cube = new Cube({
                        scale: 10,
                        material: new TestMaterial(),
                        position: position.multiply(new Vec(-1, -1, -1))
                    });
    
                    this.scene.add(cube);
                }
            }

            // console.log(ray);
        })

        this.createScene();

        const guides = [
            new Guide({ position: new Vec(700, 400, 0) }),
            new Guide({ position: new Vec(200, 800, 1000) }),
            new Guide({ position: new Vec(-300, 200, -800) }),
        ];

        this.scene.add(guides);

        const vec = new Vector({
            points: [
                new Vec(700, 400, 0),
                new Vec(200, 800, 1000),
                new Vec(-300, 200, -800),
            ],
        });
        console.log(vec);
        
        this.scene.add(vec);

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
