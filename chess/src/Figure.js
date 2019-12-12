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
        this.addTrait({
            onUpdate: () => {
                if(this.position.y < 0) {
                    this.position.y = 0;
                    this.velocity.y = 0;
                }
            }
        });

        this.moveTarget = [
            this.position.x,
            this.position.y,
            this.position.z,
        ];
    }

    onCreate(args) {
        // args.hitbox = [3, 1, 0, -1, 1];

        if(args.side == 1) {
            args.material = new DefaultMaterial({
                texture: new Texture(),
                diffuseColor: [0.65, 0.63, 0.6, 1]
            });;
        } else {
            args.material = new DefaultMaterial({
                texture: new Texture(),
                diffuseColor: [0.1, 0.1, 0.1, 1]
            });;
        }
    }

    update(ms) {
        super.update(ms);

        if(this.hover) {
            this.velocity.y = (this.moveTarget[1] - this.position.y) / 10;
            this.velocity.x = (this.moveTarget[0] - this.position.x) / 10;
            this.velocity.z = (this.moveTarget[2] - this.position.z) / 10;
        }
    }

    moveTo(x, z) {
        this.moveTarget[0] = x;
        this.moveTarget[2] = z;
    }

    pickup() {
        this.lastPosition = [
            this.position.x, 
            this.position.z
        ];

        this.moveTarget[1] = 4;
        this.hover = true;
    }

    release() {
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.hover = false;
    }

}