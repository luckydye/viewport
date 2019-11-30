import { Vec } from '../Math';

const keyRegister = new Map();

window.addEventListener('keydown', e => {
	if(document.activeElement == document.body) {
		keyRegister.set(e.key, true);
	}
});

window.addEventListener('keyup', e => {
	keyRegister.delete(e.key);
});

export default  {

    onCreate(entity) {
        entity.direction = new Vec();
        entity.speed = 0.005;
		entity.player = true;
		entity.jumppower = 0.08;
		
		window.addEventListener('keydown', e => {
			if(document.activeElement == document.body) {
				if(e.key == " ") {
					this.jump(entity);
				}
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
			entity.velocity.y = entity.jumppower;
			entity.airborn = true;
		}
    },
    
    checkKey(key) {
        return keyRegister.has(key);
    },

    onUpdate(entity, ms) {
        if(!entity.player) return;

		if(!entity.airborn) {
			if (this.checkKey("a")) this.strafe(entity, -entity.speed);
			if (this.checkKey("d")) this.strafe(entity, entity.speed);
		} else {
			if (this.checkKey("a")) this.strafe(entity, -entity.speed / 8);
			if (this.checkKey("d")) this.strafe(entity, entity.speed / 8);
		}

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

		entity.velocity.x += (entity.direction.z * camDirectionInv[0]) + (entity.direction.x * camDirection[2]);
		entity.velocity.y += (entity.direction.z * camDirectionInv[1]) + entity.direction.y;
		entity.velocity.z += (entity.direction.z * camDirectionInv[2]) + (entity.direction.x * camDirection[0]);

		entity.position.x += entity.velocity.x;
		entity.position.y += entity.velocity.y;
		entity.position.z += entity.velocity.z;
		entity.position[3] = 1;

		if(entity.airborn) {
			entity.velocity.x *= 0.995;
			entity.velocity.z *= 0.995;
		} else {
			entity.velocity.x *= 0.925;
			entity.velocity.z *= 0.925;
		}

		if(!entity.airborn) {
			entity.direction.x = 0;
			entity.direction.y = 0;
			entity.direction.z = 0;
		}
    },

}
