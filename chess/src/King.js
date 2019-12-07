import { Resources } from '../../src/resources/Resources';
import Collider from '../../src/traits/Collider';
import RigidBody from '../../src/traits/RigidBody';
import { Figure } from './Figure';

Resources.add({
    'King': 'models/king.obj',
});

let verts;

Resources.loaded().then(() => {
    verts = Resources.get('King').getVertecies();
});

export class King extends Figure {

    get vertecies() {
        return verts;
    }

}