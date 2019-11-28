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
        this.traits = new Set(args.traits || []);
    }

    createBuffer() {
        for (let trait of this.traits) {
            trait.onCreate(this);
        }
        
        return super.createBuffer();
    }

    update(ms = 0) {
        super.update(ms);

        for (let trait of this.traits) {
            trait.onUpdate(this, ms);
        }

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.position.z += this.velocity.z;
		this.position[3] = 1;

		let resistance = this.weight;

		this.velocity.x *= resistance;
		this.velocity.y *= resistance;
		this.velocity.z *= resistance;
    }

    addTrait(trait) {
        this.traits.add(trait);
    }

    removeTrait(trait) {
        this.traits.delete(trait);
    }

    setPositionTo(transform) {
        this.position = transform.position;
        this.rotation = transform.rotation;
    }
}