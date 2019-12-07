import { Resources } from '../../src/resources/Resources';
import Collider from '../../src/traits/Collider';
import RigidBody from '../../src/traits/RigidBody';
import { Figure } from './Figure';

Resources.add({
    'Farmer': 'models/farmer.obj',
});

let verts;

Resources.loaded().then(() => {
    verts = Resources.get('Farmer').getVertecies();
});

export class Farmer extends Figure {

    get vertecies() {
        return verts;
    }

}