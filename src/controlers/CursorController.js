import { EntityControler } from "./EntityControler.js";
import { Vec, Raycast, Transform } from "../Math.js";

export class CursorControler extends EntityControler {

    initMouse() {

        const curosr = this.entity;
        const renderer = this.viewport.renderer;
        const camera = this.viewport.camera;

        let moving = false;
        let currentObject = null;
        let selectedObject = null;

        const down = e => {
            if (EntityControler.isMouseButton(e) == 2) {
                moving = true;

                selectedObject = currentObject;

                console.log(selectedObject);
            }
        }

        const up = e => {
            moving = false;
        }

        let startdelta = null;

        const move = e => {
            test(e);

            if (moving) {
                const pos = Vec.multiply(selectedObject.position, new Vec(-1, -1, 1));

                let hitx = new Raycast(camera, e.x, e.y).hit(pos, new Vec(0, 1, 0)) ||
                             new Raycast(camera, e.x, e.y).hit(pos, new Vec(0, -1, 0));

                let hity = new Raycast(camera, e.x, e.y).hit(pos, new Vec(1, 0, 0)) ||
                             new Raycast(camera, e.x, e.y).hit(pos, new Vec(-1, 0, 0));

                hitx = hitx || new Transform();
                hity = hity || new Transform();

                if (!startdelta) {
                    startdelta = new Vec(
                        hitx.position[0] - selectedObject.position[0],
                        hity.position[1] - selectedObject.position[1],
                        hitx.position[2] - selectedObject.position[2],
                    );
                } else {
                    let axis = 1;
                    selectedObject.position[axis] = hity.position[axis] - startdelta[axis];
                }
            } else {
                startdelta = null;
            }
        }

        const test = e => {
            if (!moving) {

                const scene = this.viewport.scene;

                const bounds = renderer.canvas.getBoundingClientRect();
                const pixel = renderer.readPixelFromBuffer('id', e.x - bounds.x, bounds.height - (e.y - bounds.y));

                //n ewstuff
                if(pixel[3] > 0) {
                    const objIndex = Math.round(pixel[0] / 256 * scene.objects.size);
                    const object = [...scene.objects][objIndex];

                    currentObject = object;
                }
            }
        }

        this.viewport.addEventListener("mousedown", e => down(e));
        this.viewport.addEventListener("mouseup", up);
        this.viewport.addEventListener("mousemove", move);
    }

}
