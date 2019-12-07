import { Resources } from '../../src/resources/Resources';
import Collider from '../../src/traits/Collider';
import RigidBody from '../../src/traits/RigidBody';
import { Figure } from './Figure';

Resources.add({
    'Bishop': 'models/bishop.obj',
});

let verts;

Resources.loaded().then(() => {
    verts = Resources.get('Bishop').getVertecies();
});

export class Bishop extends Figure {

    get vertecies() {
        return verts;
    }

}