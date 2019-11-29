import { Geometry } from "./Geometry.js";
import { Vec } from "../Math.js";

export class Entity extends Geometry {

    constructor(args) {
        super(args);

        this.name = "Entity";
        this.matrixAutoUpdate = true;

        this.hitboxGeometry = null;

        this.weight = 0.99;
        this.velocity = new Vec();
        this.traits = new Set();

        if(args.traits) {
            for(let trait of args.traits) {
                this.addTrait(trait);
            }
        }
    }

    createBuffer() {
        for (let trait of this.traits) {
            if(trait.onCreate) trait.onCreate(this);
        }
        
        return super.createBuffer();
    }

    update(ms = 0) {
        super.update(ms);

        for (let trait of this.traits) {
            if(trait.onUpdate) trait.onUpdate(this, ms);
        }

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.position.z += this.velocity.z;
		this.position[3] = 1;
    }

    intersects(collider) {
        for (let trait of this.traits) {
            if(trait.onIntersect) trait.onIntersect(this, collider);
        }
    }

    hasTrait(trait) {
        return this.traits.has(trait);
    }

    addTrait(trait) {
        this.traits.add(trait);

        if(trait.methods) {
            for(let key in trait.methods) {
                this[key] = trait.methods[key];
            }
        }
    }

    removeTrait(trait) {
        this.traits.delete(trait);
    }

    setPositionTo(transform) {
        this.position = transform.position;
        this.rotation = transform.rotation;
    }
}