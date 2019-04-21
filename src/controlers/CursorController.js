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

        let moving = false;
        let selected = [0, 0, 0];

        const plane = new Vec(0, curosr.position.y + 10, 0);
        const normal = new Vec(0, 1, 0);
        
        let startdelta = [];

        const check = () => {
            if(!renderer.readings.guides) return;

            const v = renderer.readings.guides.value;

            selected = [0,0,0];

            if(v[0] > 0) selected[0] = 1;
            if(v[1] > 0) selected[1] = 1;
            if(v[2] > 0) selected[2] = 1;

            this.interaction(selected);
        }
        
		const down = e => {
            check();
    
            const ray = new Raycast(camera, e.x, e.y);
            const hit = ray.hit(plane, normal);
            
            startdelta = [
                (hit.position[0] - curosr.position.x),
                (hit.position[1] - curosr.position.y),
                (hit.position[2] - curosr.position.z),
            ]

            moving = true;
		}
		const up = e => {
			moving = false;
        }

		const move = e => {
			if(moving) {
    
                const ray = new Raycast(camera, e.x, e.y);
                const hit = ray.hit(plane, normal);

                const [x, y, z] = [
                    hit.position[0] - startdelta[0],
                    hit.position[1] - startdelta[1],
                    hit.position[2] - startdelta[2],
                ]

                if(hit) {
                    if(selected[0]) curosr.position.x = x;
                    if(selected[1]) curosr.position.y = y;
                    if(selected[2]) curosr.position.z = z;
                }
            }
		}

        this.viewport.addEventListener('click', (e) => {
            const x = e.x;
            const y = this.viewport.renderer.height - e.y;

            if(!renderer.readings.guides) {
                renderer.readFromBuffer(x, y, 'guides');
            } else {
                renderer.readings.guides.x = x;
                renderer.readings.guides.y = y;
            }
        })

		this.viewport.addEventListener("mousedown", down);
		this.viewport.addEventListener("mouseup", up);
		this.viewport.addEventListener("mousemove", move);
    }
    
    interaction(selected) {

    }

}
