import { Entity } from '../../src/scene/Entity';

export class Platform extends Entity {

    onCreate() {
        setInterval(() => {
            this.velocity.x = Math.sin(performance.now() / 500) * 0.1;
        }, 14);
    }

}
