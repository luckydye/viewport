import { Geometry } from "./Geometry";
import { Vec } from "../Math";

export class Entity extends Geometry {

    velocity = new Vec();

    traits = new Set();

    onCreate(args) {
        
    }

    update(ms) {
        for(let trait of this.traits) {
            trait(ms);
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