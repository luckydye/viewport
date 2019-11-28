import { Geometry } from "./Geometry.js";
import { Vec } from "../Math.js";

export class Entity extends Geometry {

    constructor(args) {
        super(args);

        this.name = "Entity";
        this.matrixAutoUpdate = true;

        this.hitboxGeometry = null;

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
            trait.onUpdate(ms);
        }
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