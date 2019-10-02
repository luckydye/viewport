import { Renderer } from "../src/renderer/Renderer.js";
import { Resources } from "../src/Resources.js";
import { Scene } from "../src/scene/Scene.js";
import { Scheduler } from "../src/Scheduler.js";
import { Camera } from '../src/scene/Camera.js';
import { ViewportController } from '../src/controlers/ViewportController.js';
import { Guide } from '../src/geo/Guide.js';
import PrimitivetMaterial from '../src/materials/PrimitiveMaterial.js';

export default class Viewport extends HTMLElement {

    get frameRate() {
        return 1000 / this.renderer.frameTime;
    }

    static get template() {
        return `
            <style>
                :host {
                    display: block;
                    position: relative;
                }
                canvas {
                    width: 100%;
                    height: 100%;
                    display: block;
                    object-position: center;
                    object-fit: cover;
                }
                .stats {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    z-index: 10000;
                    color: white;
                    opacity: 0.75;
                    pointer-events: none;
                    user-select: none;
                    margin: 0;
                }
                .axis {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    pointer-events: none;
                }
            </style>

            <div class="axis">
                <canvas id="axis" width="50px" height="50px"></canvas>
            </div>
            <pre class="stats"></pre>
        `;
    }

    constructor(controllertype = ViewportController) {
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

        if(controllertype) {
            new controllertype(this.camera, this);
        }

        this.addEventListener('click', e => {
            const bounds = this.getBoundingClientRect();
            const pixel = this.renderer.readPixel(e.x - bounds.x, e.y - bounds.y);
            console.log(pixel);
        });
    }

    setScene(scene) {
        this.scene = scene;
        this.scene.add(this.camera);
    }

    connectedCallback() {

        this.root.innerHTML = this.constructor.template;
        this.root.appendChild(this.canvas);

        this.statsElement = this.shadowRoot.querySelector('.stats');

        Resources.load().then(() => {
            this.init(this.canvas);
            this.render();
        });

        // axis
        this.axisDisplay = new Renderer(this.shadowRoot.querySelector('#axis'));
        this.axisDisplay.renderPasses.splice(0, 2);
        this.axisDisplay.renderPasses.splice(1, 1);
        this.axisDisplay.background = [0, 0, 0, 0];
        const axisScene = new Scene([ 
            new Camera({ 
                position: [0, 0, -2000],
                perspective: Camera.ORTHGRAPHIC
            }) 
        ]);
        this.axis = new Guide({
            scale: 0.25,
        });
        axisScene.add(this.axis);
        this.axisDisplay.scene = axisScene;
    }

    render() {
        const currentFrame = performance.now();
        const delta = currentFrame - this.frame.lastFrame;
        
        this.frame.nextFrame = requestAnimationFrame(this.render.bind(this));

        if(this.offsetWidth + this.offsetHeight === 0) {
            return;
        }

        this.frame.accumulator += delta;

        this.renderer.info.drawtime = this.frame.accumulator.toFixed(1);

        if (this.frame.accumulator >= (1000 / this.frame.tickrate)) {
            this.frame.accumulator = 0;

            this.scene.update(delta);
            this.scheduler.run(delta);
        }
        
        this.renderer.draw(this.scene, {
            camera: this.camera,
        });

        this.axis.rotation.x = this.camera.rotation.x;
        this.axis.rotation.y = this.camera.rotation.y;
        this.axis.rotation.z = this.camera.rotation.z;
        this.axisDisplay.draw(this.axisDisplay.scene);

        this.frame.lastFrame = currentFrame;

        this.renderer.info.cputime = (performance.now() - currentFrame).toFixed(1);

        if(this.renderer.debug) {
            this.statsElement.innerHTML = JSON.stringify(this.renderer.info, null, '  ');
        } else if(!this.renderer.debug && this.statsElement.innerHTML != "") {
            this.statsElement.innerHTML = "";
        }
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
