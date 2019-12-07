import { Resources } from '../../src/resources/Resources';
import Collider from '../../src/traits/Collider';
import RigidBody from '../../src/traits/RigidBody';
import { Figure } from './Figure';

Resources.add({
    'Tower': 'models/tower.obj',
});

let verts;

Resources.loaded().then(() => {
    verts = Resources.get('Tower').getVertecies();
});

export class Tower extends Figure {

    get vertecies() {
        return verts;
    }

}