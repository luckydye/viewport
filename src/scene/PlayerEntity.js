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
        args.vertecies = [];
        args.hitbox = [2, 2, 0, -1.75, 1];
        args.scale = 0.33;
    }

}
