import { Resources } from '../../src/resources/Resources';
import Collider from '../../src/traits/Collider';
import RigidBody from '../../src/traits/RigidBody';
import { Figure } from './Figure';

Resources.add({
    'Horse': 'models/horse.obj',
});

let verts;

Resources.loaded().then(() => {
    verts = Resources.get('Horse').getVertecies();
});

export class Horse extends Figure {

    get vertecies() {
        return verts;
    }

}