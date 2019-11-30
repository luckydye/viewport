import { Vec } from '../Math';
import Input from '../Input';

export default  {

    onCreate(entity) {
        entity.direction = new Vec();
        entity.speed = 0.01;
		entity.player = true;
		entity.jumppower = 0.33;
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

    onUpdate(entity, ms) {
        if(!entity.player) return;

		if (Input.pressed("a", 14)) this.strafe(entity, -entity.speed);
		if (Input.pressed("d", 15)) this.strafe(entity, entity.speed);
		// if (Input.pressed("q")) this.pan(entity, -entity.speed);
		// if (Input.pressed("y")) this.pan(entity, entity.speed);
		if (Input.pressed(" ", 0)) this.jump(entity);

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

		entity.direction.x = 0;
		entity.direction.y = 0;
		entity.direction.z = 0;
    },

}
