import { EntityControler } from "./EntityControler";
import { Vec, Raycast } from "../Math";

export class CursorControler extends EntityControler {

    lastAction = {
        target: null,
        state: null,
        property: null
    }

	initMouse() {
        const curosr = this.entity;
        const renderer = this.viewport.renderer;
        const camera = this.viewport.camera;
        const scene = this.viewport.scene;

        let moving = false;
        let hovering = false;
        let selected = null;
        let color = [0, 0, 0];
        
		const down = e => {
            if(EntityControler.isMouseButton(e) == 1) {
                this.interaction(selected);

                if(hovering) {
                    moving = selected == 1;
                }
    
                if(!moving) {
                    for(let obj of scene.objects) {
                        if(obj.id == selected) {
                            this.viewport.setCursor(obj);
                            this.viewport.onselect(obj);
                
                            this.lastAction.target = curosr;
                            this.lastAction.property = 'position';
                            this.lastAction.state = new Vec(curosr.position);
                        }
                    }
                }
            }
        }
        
		const up = e => {
			moving = false;
        }
        
        let startdelta = null;

		const move = e => {
            test(e);

			if(moving) {
                const pos = Vec.multiply(curosr.position, new Vec(-1, -1, 1));
                const hitx = new Raycast(camera, e.x, e.y).hit(pos, new Vec(0, 1, 0)) ||
                             new Raycast(camera, e.x, e.y).hit(pos, new Vec(0, -1, 0));

                const hity = new Raycast(camera, e.x, e.y).hit(pos, new Vec(1, 0, 0)) ||
                             new Raycast(camera, e.x, e.y).hit(pos, new Vec(-1, 0, 0));

                if(!hitx && !hity) return;

                if(!startdelta) {
                    startdelta = new Vec(
                        hitx.position[0] - curosr.position[0],
                        hity.position[1] - curosr.position[1],
                        hitx.position[2] - curosr.position[2],
                    );
                } else {
                    let axis = color.indexOf(Math.max(...color));
                    if(axis == 1) {
                        curosr.position[axis] = hity.position[axis] - startdelta[axis];
                    } else {
                        curosr.position[axis] = hitx.position[axis] - startdelta[axis];
                    }
                }
            } else {
                startdelta = null;
            }
        }

        const test = e => {
            const x = e.x;
            const y = this.viewport.renderer.height - e.y;

            if(!moving) {
                renderer.readPixelFromBuffer(x, y, 'id').then(value => {
                    selected = value[0];
                    hovering = selected == 1;
                    this.entity.material.selected = hovering;
                })
                renderer.readPixelFromBuffer(x, y, 'guides').then(value => {
                    color = value;
                })
            }
        }
        
        const keydown = (e) => {
            if(e.ctrlKey)

            switch(e.key) {
                case "z":
                    this.undo();
                    break;
            }
        }

		this.viewport.addEventListener("contextmenu", e => e.preventDefault());
		this.viewport.addEventListener("mousedown", e => {
            down(e);
        });
		this.viewport.addEventListener("mouseup", up);
        this.viewport.addEventListener("mousemove", move);
        
		window.addEventListener("keydown", keydown);
    }

    undo() {
        const action = this.lastAction;

        action.target[action.property][0] = action.state.x;
        action.target[action.property][1] = action.state.y;
        action.target[action.property][2] = action.state.z;
    }
    
    interaction(objId) {

    }

}
