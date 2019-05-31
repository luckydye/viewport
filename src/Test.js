import Config from "./Config";
import { Task, Scheduler } from "./Scheduler";
import Viewport from "../Viewport";
import { Resources } from "./Resources";
import { Transform } from "./Math";
import { Menu } from '@uncut/viewport-gui/components/Menu';
import { UIWindow } from '@uncut/viewport-gui/components/UIWindow';
import DefaultMaterial from './materials/DefaultMaterial';
import * as geometry from './geo/*.*';
import * as lights from './light/*.*';
import Editor from '@uncut/node-editor';

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
            }
            span {
                display: block;
                padding: 5px 8px;
                background: #1c1c1c;
                margin-right: 10px;
                opacity: 0.75;
                border-radius: 4px;
                min-width: 28px;
                text-align: center;
            }
            #details {
                display: flex;
                position: fixed;
                bottom: 10px;
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
                Test.initUI(viewport);
                callback(viewport);
            }

            document.body.appendChild(viewport);
        });
    }

    static initUI(viewport) {
        const nodewindow = new UIWindow({ uid: "nodewindow", title: "Node Editor" });
        nodewindow.style.width = "700px";
        nodewindow.style.height = "300px";
        nodewindow.style.background = "#1c1c1c";
        nodewindow.innerHTML = `
            <style>
                node-editor {
                    position: relative;
                    outline: none;
                }
            </style>
        `;
        nodewindow.appendChild(new Editor());

        const objwindow = new UIWindow({ uid: "objwindow", title: "Object Viewer" });

        objwindow.innerHTML = `
            <div class="geo-name"></div>
        `;

        const createwin = new UIWindow({ uid: "createwin", title: "Create" });

        createwin.innerHTML = `
            <div class="items">
                <div class="craete-item" title="Cube" geo="Cube"></div>
                <div class="craete-item" title="Plane" geo="Plane"></div>
                <div class="craete-item" title="Pointlight" light="Pointlight"></div>
                <style>
                    .items {
                        display: flex;
                        flex-wrap: wrap;
                        max-width: 168px;
                    }
                    .craete-item {
                        width: 40px;
                        height: 40px;
                        color: white;
                        background: #666;
                        margin: 1px;
                    }
                    .craete-item:hover {
                        background: #777;
                    }
                </stlye>
            </div>
        `;

        for(let item of createwin.querySelectorAll('[geo]')) {
            item.onclick = () => {
                const geo = item.getAttribute('geo');
                const Geometry = geometry[geo].js[geo];
                viewport.scene.add(new Geometry({
                    metrial: new DefaultMaterial(),
                    scale: 100,
                    id: Math.floor(Math.random() * 100),
                }));
            }
        }

        for(let item of createwin.querySelectorAll('[light]')) {
            item.onclick = () => {
                const light = item.getAttribute('light');
                const Light = lights[light].js[light];
                viewport.scene.add(new Light());
            }
        }

        const properties = objwindow.querySelector('.geo-name');

        viewport.onselect = (obj) => {
            objwindow.getElement('.content').style.padding = "10px";
            properties.innerHTML =  `<pre style="margin: 0">\n` +
                                    `type: ${obj.constructor.name}\n` +
                                    `material: ${obj.material.constructor.name}\n` +
                                    `position: ${obj.position}\n` +
                                    `rotation: ${obj.rotation}\n` +
                                    `origin: ${obj.origin}\n` +
                                    `scale: ${obj.scale}\n` +
                                    `id: ${obj.id}\n` +
                                    `instanced: ${obj.instanced}\n` +
                                    `hidden: ${obj.hidden}\n` +
                                    '</pre>';
        }

        const menu = new Menu();
        document.body.appendChild(menu);

        menu.createItem({
            name: "Create",
            onclick() {
                createwin.toggle();
            }
        });
        menu.createItem({
            name: "Properties",
            onclick() {
                objwindow.toggle();
            }
        });
        menu.createItem({
            name: "Node Editor",
            onclick() {
                nodewindow.toggle();
            }
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

        const configTask = new Task(Scheduler.timer(100, (dt) => {
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