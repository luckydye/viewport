import { Entity } from '../../src/scene/Entity';
import Collider from '../../src/traits/Collider';
import RigidBody from '../../src/traits/RigidBody';
import { Cube } from '../../src/geo/Cube';

const verts = new Cube().vertecies;

export class Figure extends Entity {

    constructor(args) {
        super(args);
        
        this.addTrait(RigidBody);
        this.addTrait(Collider);
    }

    onCreate(args) {
        args.vertecies = verts;
        args.hitbox = [1, 1, -1, -1, 1];
    }

}