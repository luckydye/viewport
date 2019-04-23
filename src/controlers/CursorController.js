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
                const objID = (value[0] / 255) * scene.objects.size;
                this.interaction(objID);
    
                moving = true;
            })
        }
        
		const up = e => {
			moving = false;
        }
        
        let startdelta = null;

		const move = e => {
			if(moving) {
                const plane = new Vec(0, curosr.position.y, 0);
                const normal = new Vec(0, 1, 0);

                const hit = new Raycast(camera, e.x, e.y).hit(plane, normal);

                if(hit) {
                    if(!startdelta) {
                        startdelta = new Vec(
                            hit.position[0] - curosr.position[0],
                            hit.position[1] - curosr.position[1],
                            hit.position[2] - curosr.position[2],
                        );
                    } else {
                        const axis = startdelta.indexOf(Math.max(...startdelta));
                        curosr.position[axis] = hit.position[axis] - startdelta[axis];
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
