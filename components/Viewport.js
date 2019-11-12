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

export default class Viewport extends HTMLElement {

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

    constructor({
        controllertype = ViewportController,
        canvas = null,
        offscreen = null
    } = {}) {
        super();

        this.scheduler = new Scheduler();

        this.attachShadow({ mode: 'open' });
        this.root = this.shadowRoot;

        this.canvas = canvas;

        if(offscreen) {
            this.offscreen = true;
        }

        this.cursor = new Cursor();
        this.renderer = new Renderer(offscreen || canvas);
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
        } else {
            this.cursor.parent = geo;
            this.scene.add(this.cursor);
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
            if(e.button === 0) {
                this.selectedColor = null;

                const bounds = this.getBoundingClientRect();
                const color = this.renderer.readPixelFromBuffer('index', 
                    e.x - bounds.x, 
                    bounds.height - (e.y - bounds.y)
                );
                
                if(color[3] > 0) {
                    const index = color[0];
                    const geo = [...this.renderer.currentScene.objects][index];
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

    showViewAxis() {
        // axis
        this.axisDisplay = new Renderer(this.shadowRoot.querySelector('#axis'));
        this.axisDisplay.showGrid = false;
        this.axisDisplay.renderPasses.splice(0, 2);
        this.axisDisplay.renderPasses.splice(1, 1);
        this.axisDisplay.background = [0, 0, 0, 0];
        const axisScene = new Scene([ 
            new Camera({ 
                position: [0, 0, -20],
                perspective: Camera.ORTHGRAPHIC
            }) 
        ]);
        this.axis = new Guide({
            scale: 0.25,
        });
        axisScene.add(this.axis);
        this.axisDisplay.scene = axisScene;
    }

    connectedCallback() {
        this.root.innerHTML = this.constructor.template;
        if(this.canvas) {
            this.root.appendChild(this.canvas);
        }

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
