import Test from "../../src/Test";
import { Menu } from '@uncut/viewport-gui/components/Menu';
import { UIWindow } from '@uncut/viewport-gui/components/UIWindow';
import DefaultMaterial from './../../src/materials/DefaultMaterial';
import * as geometry from '../../src/geo/*.*';
import * as lights from '../../src/light/*.*';


const resources = {
    'desk': require('../../res/models/desk_exploded.obj'),
}

Test.viewportTest(resources, viewport => {

    const propswin = new UIWindow({ uid: "propwindow", title: "Properties" });

    propswin.innerHTML = `
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

    const properties = propswin.querySelector('.geo-name');

    viewport.onselect = (obj) => {
        properties.innerHTML = JSON.stringify(obj);
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
            propswin.toggle();
        }
    });

});
