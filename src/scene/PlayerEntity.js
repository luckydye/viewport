import { Entity } from './Entity';
import DefaultMaterial from '../materials/DefaultMaterial';
import { Texture } from '../materials/Texture';
import RigidBody from '../traits/RigidBody';
import Collider from '../traits/Collider';
import Player from '../traits/Player';
import { Loader } from '../resources/Loader';
import { Resources } from '../resources/Resources';

export class PlayerEntity extends Entity {

    constructor(args = {}) {
        super(args);
        
        this.addTrait(Player);
        this.addTrait(Collider);

        this.material = new DefaultMaterial();

        this.position.x = 0;
        this.position.y = 10;
        this.position.z = 0;
    }

    onCreate(args) {
        args.hitbox = [1, 1, -1, -1, 1];
    }

}
