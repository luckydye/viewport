import { Vec } from '../Math';

const keyRegister = new Map();

window.addEventListener('keydown', e => {
	keyRegister.set(e.key, true);
});

window.addEventListener('keyup', e => {
	keyRegister.delete(e.key);
});

export default  {

    onCreate(entity) {
        entity.direction = new Vec();
        entity.speed = 0.0005;
		entity.player = true;
		
		window.addEventListener('keydown', e => {
			if(e.key == " ") {
				this.jump(entity);
			}
		});
    },

    move(entity, dir) {
		entity.direction.z = dir;
	},

	pan(entity, dir) {
		entity.direction.y = -dir;
	},

	strafe(entity, dir) {
		entity.direction.x = dir;
    },

	jump(entity) {
		if(!entity.airborn) {
			entity.velocity.y = 0.07;
			entity.airborn = true;
		}
    },
    
    checkKey(key) {
        return keyRegister.has(key);
    },

    onUpdate(entity, ms) {
        if(!entity.player) return;

		// if (this.checkKey("w")) this.move(entity, entity.speed);
		// if (this.checkKey("s")) this.move(entity, -entity.speed);

		if (this.checkKey("a")) this.strafe(entity, -entity.speed);
		if (this.checkKey("d")) this.strafe(entity, entity.speed);

		if (this.checkKey("q")) this.pan(entity, -entity.speed);
		if (this.checkKey("y")) this.pan(entity, entity.speed);

        const camDirectionInv = [
			Math.sin(-entity.rotation.y),
			Math.max(Math.min(Math.tan(entity.rotation.x), 1), -1),
			Math.cos(-entity.rotation.y),
		]

		const camDirection = [
			Math.sin(entity.rotation.y),
			Math.max(Math.min(Math.tan(entity.rotation.x), 1), -1),
			Math.cos(entity.rotation.y),
		]

		entity.direction.x *= ms;
		entity.direction.y *= ms;
		entity.direction.z *= ms;

		entity.velocity.x += (entity.direction.z * camDirectionInv[0]) + (entity.direction.x * camDirection[2]);
		entity.velocity.y += (entity.direction.z * camDirectionInv[1]) + entity.direction.y;
		entity.velocity.z += (entity.direction.z * camDirectionInv[2]) + (entity.direction.x * camDirection[0]);

		entity.position.x += entity.velocity.x;
		entity.position.y += entity.velocity.y;
		entity.position.z += entity.velocity.z;
		entity.position[3] = 1;

		entity.velocity.x *= 0.95;
		entity.velocity.y *= 0.99;
		entity.velocity.z *= 0.95;

		entity.direction.x = 0;
		entity.direction.y = 0;
        entity.direction.z = 0;
    },

}
