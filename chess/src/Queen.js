import { Resources } from '../../src/resources/Resources';
import Collider from '../../src/traits/Collider';
import RigidBody from '../../src/traits/RigidBody';
import { Figure } from './Figure';

Resources.add({
    'Queen': 'models/queen.obj',
});

let verts;

Resources.loaded().then(() => {
    verts = Resources.get('Queen').getVertecies();
});

export class Queen extends Figure {

    get vertecies() {
        return verts;
    }

}