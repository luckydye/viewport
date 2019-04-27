import Config from "./Config";
import { Task, Scheduler } from "./Scheduler";
import Viewport from "../Viewport";
import { Resources } from "./Resources";
import { Transform } from "./Math";

function css(strings) {
    const styles = document.createElement('style');
    styles.innerHTML = strings;
    return styles;
}

export default class Test {

    static get styles() {
        return css`
            body {
                margin: 0;
                overflow: hidden;
                background: black;
            }
            gl-viewport {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: pink;
            }
            span {
                display: block;
                padding: 5px 8px;
                background: #1c1c1c;
                margin-right: 10px;
                opacity: 0.75;
                border-radius: 4px;
            }
            #details {
                display: flex;
                position: fixed;
                top: 10px;
                left: 10px;
                font-size: 14px;
                font-family: sans-serif;
                color: white;
                z-index: 1000;
                user-select: none;
                width: 100%;
            }
        `;
    }

    static get template() {
        return `
            <div id="details"></div>
        `;
    }

    static viewportTest(resources = {}, callback) {

        Resources.add(resources, false);

        window.addEventListener('DOMContentLoaded', () => {
            document.body.innerHTML = Test.template;
            document.head.appendChild(Test.styles);

            const viewport = new Viewport();
    
            viewport.onload = () => {
                Test.initHelperTasks(viewport);
                callback(viewport);
            }

            document.body.appendChild(viewport);
        });
    }

    static initHelperTasks(viewport) {
        const scheduler = viewport.scheduler;
        const camera = viewport.camera;
        const scene = viewport.scene;
    
        const savedPosition = Config.global.getValue('camera');
        if(savedPosition) {
            camera.setPositionTo(new Transform(savedPosition));
        }

        const configTask = new Task(Scheduler.timer(24, (dt) => {
            Config.global.setValue('camera', camera);
            details.innerHTML = `
                <span>${camera.position}</span>
                <span>${camera.rotation}</span>
                <span>${viewport.frameRate.toFixed(0)}</span>
                <span>${scene.curosr.position}</span>
            `;
            return false;
        }));
        scheduler.addTask(configTask);
    }

}