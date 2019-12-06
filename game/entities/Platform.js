import { Entity } from '../../src/scene/Entity';
import Collider from '../../src/traits/Collider';

export class Platform extends Entity {

    onCreate(args) {
        setInterval(() => {
            this.velocity.x = Math.sin(performance.now() / 500) * 0.1;
        }, 14);

        args.traits = [ Collider ];
    }

}

MapFile.OBJECT_TYPES["Platform"] = Platform;
