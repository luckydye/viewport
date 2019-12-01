import { Entity } from '../../src/scene/Entity';
import DefaultMaterial from '../../src/materials/DefaultMaterial';
import { Texture } from '../../src/materials/Texture';
import RigidBody from '../../src/traits/RigidBody';
import Collider from '../../src/traits/Collider';
import Player from '../../src/traits/Player';
import { Loader } from '../../src/resources/Loader';
import { Resources } from '../../src/resources/Resources';

Resources.add({
    'noise': "textures/noise.jpg",
    'norm': "textures/norm.png",
    'teapot': "models/teapot.obj",
    'ground': "models/ground.obj",
});

export class PlayerEntity extends Entity {

    constructor(args = {}) {
        super(args);
        
        this.addTrait(Player);
        this.addTrait(Collider);

        const noise = Resources.get('noise');
        const norm = Resources.get('norm');

        this.material = new DefaultMaterial({
            normalMap: new Texture(norm),
            specularMap: new Texture(noise),
        });

        this.position.x = 0;
        this.position.y = 10;
        this.position.z = 0;
    }

    onCreate(args) {
        const teapo = Resources.get('teapot').getVertecies();

        args.vertecies = teapo;
        args.hitbox = [2, 2, 0, -1.75, 1];
        args.scale = 0.33;
    }

}
