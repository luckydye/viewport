import DefaultMaterial from '../materials/DefaultMaterial';
import Collider from '../traits/Collider';
import Player from '../traits/Player';
import { Entity } from './Entity';

export class PlayerEntity extends Entity {

    constructor(args = {}) {
        super(args);
        
        this.addTrait(Player);
        this.addTrait(Collider);

        this.material = new DefaultMaterial();
    }

    onCreate(args) {
        args.hitbox = [1, 1, -1, -1, 1];
    }

}
