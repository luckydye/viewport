import DefaultMaterial from '../materials/DefaultMaterial';
import { Entity } from '../scene/Entity';
import Collider from '../traits/Collider';
import Playable from '../traits/Playable';

export default class Player extends Entity {

    constructor(args) {
        super(args);
        
        this.addTrait(Playable);
        this.addTrait(Collider);

        this.material = new DefaultMaterial();
    }

    onCreate(args) {
        args.hitbox = [1, 1, -1, -1, 1];
    }

}
