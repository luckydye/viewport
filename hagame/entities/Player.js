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

export function createPlayer() {

    const noise = Resources.get('noise');
    const norm = Resources.get('norm');

    const teapo = Loader.loadObjFile(Resources.get('teapot'));

    return new Entity({
        material: new DefaultMaterial({
            normalMap: new Texture(norm),
            specularMap: new Texture(noise),
        }),
        hitbox: [2, 2, 0, -1.75, 1],
        position: [0, 10, 0],
        scale: 0.33,
        vertecies: teapo,
        traits: [ Player, Collider ]
    });
}
