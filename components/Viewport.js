import { Renderer } from "../src/renderer/Renderer.js";
import { Resources } from "../src/Resources.js";
import { Scene } from "../src/scene/Scene.js";
import { Scheduler } from "../src/Scheduler.js";
import { Camera } from '../src/scene/Camera.js';
import { ViewportController } from '../src/controlers/ViewportController.js';
import { Guide } from '../src/geo/Guide.js';
import PrimitivetMaterial from '../src/materials/PrimitiveMaterial.js';
import { CursorControler } from '../src/controlers/CursorController.js';
import { PlayerControler } from '../src/controlers/PlayerControler.js';
import { Cube } from '../src/geo/Cube.js';
import DefaultMaterial from '../src/materials/DefaultMaterial.js';
import { Cursor } from '../src/geo/Cursor.js';
import Config from '../src/Config.js';

export default class Viewport extends HTMLElement {

    static get template() {
        return `
            <style>
                :host {
                    display: block;
                    position: relative;
                }
                :host([active]) .crosshair {
                    display: block;
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
                .crosshair {
                    display: none;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 0;
                    height: 0;
                }
                svg {
                    stroke: white;
                    transform: translate(-50%, -50%);
                    stroke-width: 1px;
                }
            </style>

            <span class="crosshair">
                <svg width="13px" height="13px">
                    <line x1="0" y1="6.5" x2="13" y2="6.5"/>
                    <line x1="6.6" y1="0" x2="6.6" y2="13"/>
                </svg>
            </span>
            <div class="axis">
                <canvas id="axis" width="50px" height="50px"></canvas>
            </div>
            <pre class="stats"></pre>
        `;
    }

    constructor({
        controllertype = ViewportController,
    } = {}) {
        super();
        
        Config.global.load();
        Config.global.save();

        this.scheduler = new Scheduler();

        this.attachShadow({ mode: 'open' });
        this.root = this.shadowRoot;

        this.canvas = document.createElement('canvas');

        this.cursor = new Cursor();
        this.renderer = new Renderer(this.canvas);
        this.camera = new Camera({
            position: [0, -20, -20],
            rotation: [0.5, 0, 0],
            fov: 75
        });
        this.scene = new Scene([ this.camera ]);

        this.frame = {
            currentFrame: 0,
            nextFrame: 0,
            lastFrame: 0,
            accumulator: 0,
            tickrate: 128
        };

        this.controllerType = controllertype;
    }

    selectGeometry(geo) {
        if(geo == null) {
            this.cursor.parent = null;
            this.scene.remove(this.cursor);
            this.dispatchEvent(new Event('select'));
        } else {
            this.cursor.parent = geo;
            this.scene.add(this.cursor);
            this.dispatchEvent(new Event('select'));
        }
    }

    setScene(scene) {
        this.scene = scene;
        this.scene.add(this.camera);
    }

    init() {
        if(this.controllerType) {
            new this.controllerType(this.camera, this);
        }

        // resolution
        this.renderer.setResolution(this.clientWidth, this.clientHeight);

        window.addEventListener('resize', () => {
            this.renderer.setResolution(this.clientWidth, this.clientHeight);
            this.camera.position.y += 0.001;
        });

        this.dispatchEvent(new Event('load'));
    }

    enableSelecting() {
        this.selectedColor = null;

        this.renderer.preComposition = () => {
            const color = this.selectedColor;
            if(color) {
                this.renderer.compShader.setUniforms({
                    'selected': [
                        color[0] / 255,
                        color[1] / 255,
                        color[2] / 255,
                    ]
                });
            } else {
                this.renderer.compShader.setUniforms({
                    'selected': [1, 0, 0]
                });
            }
        }
        
        // selecting
        this.addEventListener('mousedown', e => {
            if(e.button === 2) {
                this.selectedColor = null;

                const bounds = this.getBoundingClientRect();
                const color = this.renderer.readPixelFromBuffer('index', 
                    e.x - bounds.x, 
                    bounds.height - (e.y - bounds.y)
                );
                
                if(color[3] > 0) {
                    const index = color[0];
                    const geo = [...this.scene.objects][index];
                    if(geo.selectable) {
                        this.selectedColor = color;
                        this.selectGeometry(geo);
                    }
                } else {
                    this.selectGeometry(null);
                }
            }
        });
    }

    connectedCallback() {
        this.root.innerHTML = this.constructor.template;
        this.root.appendChild(this.canvas);

        this.statsElement = this.shadowRoot.querySelector('.stats');

        Resources.load().then(() => {
            this.init();
            this.render();
        });
    }

    render() {
        const currentFrame = performance.now();
        const delta = currentFrame - this.frame.lastFrame;
        
        this.frame.nextFrame = requestAnimationFrame(this.render.bind(this));

        if(document.hidden) {
            this.frame.accumulator = 0;
            return;
        }

        this.frame.accumulator += delta;

        this.renderer.info.drawtime = this.frame.accumulator.toFixed(1);

        if (this.frame.accumulator >= (1000 / this.frame.tickrate)) {
            this.frame.accumulator = 0;

            this.scene.update(this.frame.tickrate);
            this.scheduler.run(this.frame.tickrate);
        }
        
        this.renderer.draw(this.scene, {
            camera: this.camera,
        });

        this.frame.lastFrame = currentFrame;

        this.renderer.info.cputime = (performance.now() - currentFrame).toFixed(1);
        this.renderer.info.fps = Math.round(1000 / delta);

        // debug
        if(this.renderer.debug) {
            const infoString = JSON.stringify(this.renderer.info, null, '  ');
            this.statsElement.innerHTML = infoString.replace(/"/g, '')
                                                    .replace(/,/g, '')
                                                    .replace(/\{|\}/g, '');

            if(this.axis) {
                this.axis.rotation.x = this.camera.rotation.x;
                this.axis.rotation.y = this.camera.rotation.y;
                this.axis.rotation.z = this.camera.rotation.z;
                this.axisDisplay.draw(this.axisDisplay.scene);
            }
        } else if(!this.renderer.debug && this.statsElement.innerHTML != "") {
            this.statsElement.innerHTML = "";
        }
    }

}

customElements.define('gl-viewport', Viewport);
