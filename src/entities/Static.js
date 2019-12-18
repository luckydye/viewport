import DefaultMaterial from '../materials/DefaultMaterial';
import { Entity } from '../scene/Entity';
import Collider from '../traits/Collider';

export default class Static extends Entity {

    constructor(args) {
        super(args);
        
        this.addTrait(Collider);

        this.material = new DefaultMaterial();
    }

    onCreate(args) {
        args.hitbox = [1, 1, -1, -1, 1];
    }

}
