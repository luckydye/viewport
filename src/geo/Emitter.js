import { VertexBuffer } from "../scene/Geometry.js";
import DefaultMaterial from "../materials/DefaultMaterial.js";
import { Vec, Transform } from "../Math.js";
import { Plane } from './Plane.js';
import { Entity } from '../scene/Entity.js';

const MAX_PARTICLE_COUNT = 500;

export class Emitter extends Entity {

    get vertecies() {
        return this.particleGeometry.vertecies;
    }

    get instancesBuffer() {
        const newBuffer = [];

        for(let p of this.particles) {
            newBuffer.push(
                p.position[0],
                p.position[1],
                p.position[2],
                p.scale
            );
        }

        this.instanceBufferCache.set(newBuffer, 0);
        return this.instanceBufferCache;
    }

    get instances() {
        return this.particles.length;
    }

    onCreate(args) {
        this.particles = [];
        this.instanced = true;
        this.rotation = new Vec(0, 0, 0);
        this.maxage = 1000;
        this.rate = 10;
        this.jitter = 2;

        this.speed = 0.25;

        this.particleGeometry = args.particleGeometry || new Plane();

        this.instanceBufferCache = new Float32Array(MAX_PARTICLE_COUNT * 4);
    }

    update(ms = 0) {
        super.update(ms);

        this.spawn(this.rate - ((Math.random()) * this.jitter), 0.25);

        this.origin.x = -this.position.x;
        this.origin.y = -this.position.y;
        this.origin.z = -this.position.z;

        for (let p of this.particles) {
            p.position[0] = p.position[0] + p.velocity[0] * this.speed;
            p.position[1] = p.position[1] + p.velocity[1] * this.speed;
            p.position[2] = p.position[2] + p.velocity[2] * this.speed;

            p.age += ms;

            p.scale *= 1.0 - (p.age / this.maxage) + 0.1;

            if (p.age > this.maxage * Math.random()) {
                this.particles.splice(this.particles.indexOf(p), 1);
            }
        }
    }

    spawn(amount, scale = 1) {
        for (let i = 0; i < amount; i++) {
            if(this.particles.length < MAX_PARTICLE_COUNT) {
                this.particles.push({
                    position: [
                        this.position.x, 
                        this.position.y, 
                        this.position.z
                    ],
                    age: 0,
                    scale: this.particleGeometry.scale * scale,
                    velocity: [
                        Math.random() + 1 / 2 - 1, 
                        Math.random() + 1 / 2 - 1, 
                        Math.random() + 1 / 2 - 1
                    ]
                });
            }
        }
    }

    createBuffer() {
        const buffer = new VertexBuffer(
			this.vertecies,
			this.indecies,
            this.constructor.attributes,
        );
        buffer.getInstanceBuffer = () => {
            return this.instancesBuffer;
        }
		return buffer;
	}

}
