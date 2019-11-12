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

export class OffscreenViewport {

    constructor({ canvas = null, } = {}) {

        this.scheduler = new Scheduler();

        this.canvas = canvas;

        this.cursor = new Cursor();
        this.renderer = new Renderer(canvas);
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

        this.init();
    }

    setScene(scene) {
        this.scene = scene;
        this.scene.add(this.camera);
    }

    init() {
        // resolution
        this.renderer.setResolution(1280, 720);

        Resources.load().then(() => {
            this.render();
        });
    }

    render() {
        const currentFrame = performance.now();
        const delta = currentFrame - this.frame.lastFrame;
        
        this.frame.nextFrame = requestAnimationFrame(this.render.bind(this));

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
    }

}
