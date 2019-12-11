import Config from '../src/Config.js';
import { Cursor } from '../src/geo/Cursor.js';
import { Renderer } from "../src/renderer/Renderer.js";
import { Resources } from "../src/resources/Resources.js";
import { Camera } from '../src/scene/Camera.js';
import { Scene } from "../src/scene/Scene.js";
import { Scheduler } from "../src/Scheduler.js";
import { Raycast, Vec } from '../src/Math.js';

export default class Viewport extends HTMLElement {

    static get template() {
        return `
            <style>
                :host {
                    display: block;
                    position: relative;
                    outline: none;
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
                .info {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    box-sizing: border-box;
                    z-index: 10000;
                    color: #eee;
                    opacity: 0.75;
                    pointer-events: none;
                    user-select: text;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                    font-size: 0.6em;
                    background: rgba(25, 25, 25, 0.75);
                    display: flex;
                    justify-content: space-between;
                }
                .info span {
                    display: inline-block;
                    padding: 4px 10px;
                }
                .info span:not(:last-child) {
                    border-right: 1px solid rgba(25, 25, 25, 0.75);
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
                .hud {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: block;
                    pointer-events: none;
                }
            </style>

            <div class="hud">
                <div class="info"></div>

                <span class="crosshair">
                    <svg width="21px" height="21px">
                        <line class="st0" x1="10" y1="0" x2="10" y2="8"/>
                        <line class="st0" x1="10" y1="12" x2="10" y2="20"/>
                        <line class="st0" x1="20" y1="10" x2="12" y2="10"/>
                        <line class="st0" x1="8" y1="10" x2="0" y2="10"/>
                    </svg>
                </span>

                <slot class="hud"></slot>
            </div>
        `;
    }

    get selected() {
        return this.cursor.parent;
    }

    constructor() {
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
            tickrate: 1000 / 128
        };

        this.root.innerHTML = this.constructor.template;
        this.root.appendChild(this.canvas);

        this.infoElement = this.shadowRoot.querySelector('.info');
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

    selectGeometry(geo, color) {
        if(geo == null) {
            this.cursor.parent = null;
            this.scene.remove(this.cursor);
            this.dispatchEvent(new Event('select'));
        } else {
            this.cursor.parent = geo;
            this.scene.add(this.cursor);
            this.cursor.updateModel();
            this.dispatchEvent(new Event('select'));
        }
    }

    setScene(scene) {
        this.scene = scene;
        this.scene.add(this.camera);
    }

    init() {
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
        let startHit = null;
        let lastPosition = null;
        let mousedown = false;
        
        this.addEventListener("mousemove", e => move(e));
        
        // selecting
        window.addEventListener('mouseup', e => {
            if(e.button === 0 && !moving && mousedown) {
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
            mousedown = false;
        });
        
        this.addEventListener('mousedown', e => {
            mousedown = true;

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

                const hit = castRay(e, direction);
                startHit = hit;

                const guided = (guideColor[0] + guideColor[1] + guideColor[2]) / 3;
                if(guided > 42) {
                    moving = true;
                    selectedObject = this.selected;

                    lastPosition = [
                        selectedObject.position[0],
                        selectedObject.position[1],
                        selectedObject.position[2],
                    ];
                }
            }
        });

        const castRay = (e, direction) => {
            const bounds = this.getBoundingClientRect();
            const cast = new Raycast(this.camera, e.x - bounds.x, e.y - bounds.y);

            let hit = null;

            if(direction == "x") {
                hit = cast.hit(new Vec(0, 0, 0), new Vec(0, 0, 1));
            }
            if(direction == "y") {
                hit = cast.hit(new Vec(0, 0, 0), new Vec(0, 0, 1));
            }
            if(direction == "z") {
                hit = cast.hit(new Vec(0, 0, 0), new Vec(0, 1, 0));
            }

            return hit;
        }

        // moveing

        const updateChildren = children => {
            for(let child of children) {
                child.object.updateModel();
                updateChildren(child.children);
            }
        }
    
        const move = e => {
            if (moving && selectedObject) {
                const hit = castRay(e, direction);

                if(direction == "x") {
                    selectedObject.position.x = lastPosition[0] + hit.position[0] - startHit.position[0];
                }
                if(direction == "y") {
                    selectedObject.position.y = lastPosition[1] + hit.position[1] - startHit.position[1];
                }
                if(direction == "z") {
                    selectedObject.position.z = lastPosition[2] + hit.position[2] - startHit.position[2];
                }

                const sceneGraph = this.scene.getSceneGraph();
                const children = sceneGraph.getChildren(selectedObject);
                selectedObject.updateModel();
                updateChildren(children);
                this.cursor.updateModel();
            }
        }
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

        // debug
        if(this.renderer.debug) {
            this.infoElement.innerHTML = `
                <div>
                    <span>${this.renderer.info.resolution}</span>
                    <span>${this.renderer.info.verts} vertecies</span>
                    <span>${this.renderer.info.objects} objects</span>
                    <span>${this.renderer.info.passes} passes</span>
                    <span>${this.renderer.info.shaders} shaders</span>
                    <span>${this.renderer.info.textures} textures</span>
                </div>

                <div>
                    <span>${this.renderer.info.fps} fps</span>
                    <span>${this.renderer.info.cputime} ms</span>
                </div>
            `;
        } else if(!this.renderer.debug && this.infoElement.innerHTML != "") {
            this.infoElement.innerHTML = "";
        }
    }

}

customElements.define('gl-viewport', Viewport);
