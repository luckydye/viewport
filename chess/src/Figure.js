import { Cube } from '../../src/geo/Cube';
import DefaultMaterial from '../../src/materials/DefaultMaterial';
import { Entity } from '../../src/scene/Entity';
import Collider from '../../src/traits/Collider';
import RigidBody from '../../src/traits/RigidBody';
import { Texture } from '../../src/materials/Texture';

export class Figure extends Entity {

    constructor(args) {
        super(args);
        
        this.addTrait(RigidBody);
        this.addTrait(Collider);
    }

    onCreate(args) {
        args.hitbox = [3, 1, 0, -1, 1];

        if(args.side == 1) {
            args.material = new DefaultMaterial({
                texture: new Texture(),
                diffuseColor: [0.9, 0.9, 0.9, 1]
            });
        } else {
            args.material = new DefaultMaterial({
                texture: new Texture(),
                diffuseColor: [0.1, 0.1, 0.1, 1]
            });
        }
        
    }

}