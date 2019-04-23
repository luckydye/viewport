import { EntityControler } from "./EntityControler";
import { Vec, Raycast } from "../Math";

export class CursorControler extends EntityControler {

	constructor(cursor, viewport) {
		super(cursor);
		
		this.viewport = viewport;

		this.initMouse();
	}

	initMouse() {
        const curosr = this.entity;
        const renderer = this.viewport.renderer;
        const camera = this.viewport.camera;
        const scene = this.viewport.scene;

        let moving = false;
        
		const down = e => {
            const x = e.x;
            const y = this.viewport.renderer.height - e.y;

            renderer.readPixelFromBuffer(x, y, 'id').then(value => {
                const objID = value[0];
                this.interaction(objID);
                moving = objID == 1;

                if(!moving) {
                    for(let obj of scene.objects) {
                        if(obj.id == objID) {
                            this.viewport.setCursor(obj);
                            this.interaction(objID);
                        }
                    }
                }
            })
        }
        
		const up = e => {
			moving = false;
        }
        
        let startdelta = null;

		const move = e => {
			if(moving) {

                const pos = Vec.multiply(curosr.position, new Vec(-1, -1, 1));
                const hitx = new Raycast(camera, e.x, e.y).hit(pos, new Vec(0, 1, 0)) ||
                             new Raycast(camera, e.x, e.y).hit(pos, new Vec(0, -1, 0));

                const hity = new Raycast(camera, e.x, e.y).hit(pos, new Vec(1, 0, 0)) ||
                             new Raycast(camera, e.x, e.y).hit(pos, new Vec(-1, 0, 0));

                if(!startdelta) {
                    startdelta = new Vec(
                        hitx.position[0] - curosr.position[0],
                        hity.position[1] - curosr.position[1],
                        hitx.position[2] - curosr.position[2],
                    );
                } else {
                    const axis = startdelta.indexOf(Math.max(...startdelta));
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

		this.viewport.addEventListener("mousedown", down);
		this.viewport.addEventListener("mouseup", up);
		this.viewport.addEventListener("mousemove", move);
    }
    
    interaction(objId) {

    }

}
