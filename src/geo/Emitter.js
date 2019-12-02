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
        this.rate = 100;

        this.particleGeometry = new Plane();

        this.instanceBufferCache = new Float32Array(MAX_PARTICLE_COUNT * 4);
    }

    update(ms = 0) {
        this.spawn(this.rate);

        for (let p of this.particles) {
            p.position[0] += p.velocity[0];
            p.position[1] += p.velocity[1];
            p.position[2] += p.velocity[2];

            p.age += ms;

            if (p.age > this.maxage * Math.random()) {
                this.particles.splice(this.particles.indexOf(p), 1);
            }
        }
    }

    spawn(amount) {
        for (let i = 0; i < amount; i++) {
            if(this.particles.length < MAX_PARTICLE_COUNT) {
                this.particles.push({
                    position: [0, 0, 0],
                    age: 0,
                    scale: 0.5,
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
