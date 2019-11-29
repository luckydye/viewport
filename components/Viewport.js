import Config from '../src/Config.js';
import { ViewportController } from '../src/controlers/ViewportController.js';
import { Cursor } from '../src/geo/Cursor.js';
import { Renderer } from "../src/renderer/Renderer.js";
import { Resources } from "../src/resources/Resources.js";
import { Camera } from '../src/scene/Camera.js';
import { Scene } from "../src/scene/Scene.js";
import { Scheduler } from "../src/Scheduler.js";

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
                    top: 0px;
                    left: 10px;
                    z-index: 10000;
                    color: white;
                    opacity: 0.75;
                    pointer-events: none;
                    user-select: none;
                    margin: 0;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
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
                    stroke-width: 0.5px;
                }
            </style>

            <span class="crosshair">
                <svg width="21px" height="21px">
                    <line class="st0" x1="10" y1="0" x2="10" y2="8"/>
                    <line class="st0" x1="10" y1="12" x2="10" y2="20"/>
                    <line class="st0" x1="20" y1="10" x2="12" y2="10"/>
                    <line class="st0" x1="8" y1="10" x2="0" y2="10"/>
                </svg>
            </span>
            
            <pre class="stats"></pre>
        `;
    }

    get selected() {
        return this.cursor.parent;
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
            tickrate: 1000 / 64
        };

        this.controllerType = controllertype;
    }

    selectGeometry(geo, color) {
        if(geo == null) {
            this.cursor.parent = null;
            this.scene.remove(this.cursor);
            this.dispatchEvent(new Event('select'));
        } else {
            this.cursor.parent = geo;
            this.scene.add(this.cursor);
            this.cursor.update();
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
        });

        this.dispatchEvent(new Event('load'));
    }

    enableCameraSaveState() {
        const lastCamPos = localStorage.getItem('camera');
        const cam = JSON.parse(lastCamPos);
        
        if(cam && cam.position && cam.rotation) {
            this.camera.position.x = cam.position[0];
            this.camera.position.y = cam.position[1];
            this.camera.position.z = cam.position[2];
            this.camera.rotation.x = cam.rotation[0];
            this.camera.rotation.y = cam.rotation[1];
            this.camera.rotation.z = cam.rotation[2];
        }

        setInterval(() => {
            localStorage.setItem('camera', JSON.stringify({
                position: this.camera.position,
                rotation: this.camera.rotation,
            }));
        }, 300);
    }

    enableSelecting() {
        this.selectedColor = null;
    
        let moving = false;
        let selectedObject = null;
        let direction = "x";
        
        this.addEventListener("mousemove", e => move(e));
        
        // selecting
        window.addEventListener('mouseup', e => {
            if(e.button === 0 && !moving) {
                this.selectedColor = null;

                const bounds = this.getBoundingClientRect();
                const color = this.renderer.readPixelFromBuffer('index', 
                    e.x - bounds.x, 
                    bounds.height - (e.y - bounds.y)
                );
                const guideColor = this.renderer.readPixelFromBuffer('guides', 
                    e.x - bounds.x, 
                    bounds.height - (e.y - bounds.y)
                );

                if(color[3] > 0) {
                    const index = color[0];
                    const geo = [...this.scene.objects][index];
                    if(geo && geo.selectable) {
                        this.selectedColor = color;

                        const guided = (guideColor[0] + guideColor[1] + guideColor[2]) / 3;
                        
                        if(geo !== this.cursor && guided < 42) {
                            this.selectGeometry(geo);
                        }

                    } else {
                        this.selectGeometry(null);
                    }
                } else {
                    this.selectGeometry(null);
                }
                        
                moving = true;
                selectedObject = this.selected;
            }

            moving = false;
        });
        
        this.addEventListener('mousedown', e => {
            if(e.button === 0 && selectedObject) {
                this.selectedColor = null;

                const bounds = this.getBoundingClientRect();
                const guideColor = this.renderer.readPixelFromBuffer('guides', 
                    e.x - bounds.x, 
                    bounds.height - (e.y - bounds.y)
                );

                if(guideColor[0] > 10) {
                    direction = "x";
                } else if(guideColor[1] > 10) {
                    direction = "y";
                } else if(guideColor[2] > 10) {
                    direction = "z";
                }

                const guided = (guideColor[0] + guideColor[1] + guideColor[2]) / 3;
                if(guided > 42) {
                    moving = true;
                    selectedObject = this.selected;
                }
            }
        });

        // moveing
    
        const move = e => {
            if (moving && selectedObject) {
                const depth = Math.sqrt(
                    Math.pow(selectedObject.position.x - this.camera.position.x, 2),
                    Math.pow(selectedObject.position.y - this.camera.position.y, 2),
                    Math.pow(selectedObject.position.z - this.camera.position.z, 2),
                ) + 1 * 10;

                let movement = (e.movementX + e.movementY) / 2;
                const rot = this.camera.rotation.y / (Math.PI / 2);

                if(direction == "x") {
                    if(rot < 1) movement *= -1;
                    selectedObject.position[direction] -= (movement / 500) * depth;

                } else if(direction == "z") {
                    if(rot > 2) movement *= -1;
                    selectedObject.position[direction] += (movement / 500) * depth;
                    
                } else if(direction == "y") {
                    selectedObject.position[direction] -= (movement / 500) * depth;
                }

                selectedObject.update();
                this.cursor.update();
            }
        }
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
        
        requestAnimationFrame(this.render.bind(this));

        if(document.hidden) {
            this.frame.accumulator = 0;
            return;
        }

        this.frame.accumulator += delta;

        this.renderer.info.drawtime = this.frame.accumulator.toFixed(1);

        while (this.frame.accumulator >= this.frame.tickrate) {
            this.frame.accumulator -= this.frame.tickrate;

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
        } else if(!this.renderer.debug && this.statsElement.innerHTML != "") {
            this.statsElement.innerHTML = "";
        }
    }

}

customElements.define('gl-viewport', Viewport);
