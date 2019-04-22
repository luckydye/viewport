import { Geometry } from "../scene/Geometry";
import DefaultMaterial from "../materials/DefaultMaterial";
import { Vec } from "../Math";

const DEFAULT_GUIDE_MATERIAL = new DefaultMaterial();

export class Particle extends Geometry {

    get vertecies() {
        const s = 20;

        const [x, y, z] = this.position;
        const d = this.direction;

        return [
            x + 0, y + 0, z + 0,    0, 0,   d[0], d[1], d[2],
            x + -s, y + 0, z + 0,    0, 0,   d[0], d[1], d[2],
            x + -s, y + s, z + 0,    0, 0,   d[0], d[1], d[2],

            x + -s, y + s, z,    0, 0,   d[0], d[1], d[2],
            x + -s, y + 0, z,    0, 0,   d[0], d[1], d[2],
            x + 0, y + 0, z + s,    0, 0,   d[0], d[1], d[2],

            x + -s, y + s, z,    0, 0,   d[0], d[1], d[2],
            x + 0, y + 0, z + s,    0, 0,   d[0], d[1], d[2],
            x + 0, y + 0, z + 0,    0, 0,   d[0], d[1], d[2],

            x + 0, y + 0, z + 0,    0, 0,   d[0], d[1], d[2],
            x + 0, y + 0, z + s,    0, 0,   d[0], d[1], d[2],
            x - s, y + 0, z + 0,    0, 0,   d[0], d[1], d[2],
        ]
    }

    constructor(origin) {
        super();

        this.base = origin;

        this.position = new Vec(this.base.position);
        this.direction = Vec.normal(Vec.add(
            this.base.rotation, 
            new Vec(Math.random() + 1 / 2 - 1, Math.random() + 1 / 2 - 1, Math.random() + 1 / 2 - 1)
        ));
    }

    kill() {
        this.base.particles.splice(this.base.particles.indexOf(this), 1);
    }

}

export class Emitter extends Geometry {

    get buffer() {
        return this.createBuffer();
    }

	onCreate(args) {
		args.material = DEFAULT_GUIDE_MATERIAL;
        args.drawmode = "TRIANGLES";

        this.particle = new Particle(this);
        
        this.instances = 1;
        this.instanced = true;

        this.rotation = new Vec(0, 0, 0);

        this.maxage = 10000;
    }

    update(ms) {
        this.spawn(10);
        
        // for(let p of this.particles) {
        //     p.position.x += p.direction.x * ms;
        //     p.position.y += p.direction.y * ms;
        //     p.position.z += p.direction.z * ms;

        //     p.age += ms;

        //     if(p.age > this.maxage * Math.random()) {
        //         p.kill();
        //     }
        // }
    }
    
    spawn(amount) {
        this.instances += amount;
    }

	get vertecies() {
		return this.particle.vertecies;
	}

}
