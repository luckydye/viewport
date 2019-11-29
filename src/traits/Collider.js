export default  {

    onCreate: (entity) => {
        entity.airborn = true;
        entity.collider = true;
    },

    onIntersect: (entity, collider) => {

		const top = collider.hitbox[0] - collider.position.y;
		const right = collider.hitbox[1] + collider.position.x;
		const bottom = collider.hitbox[2] + collider.position.y;
		const left = collider.hitbox[3] + collider.position.x;

        if(entity.position.y >= top) {
            entity.position.y = 0;
            entity.velocity.y = -entity.velocity.y / 10;
            entity.airborn = false;
        }
    },

    onUpdate: (entity, ms) => {
        
    }

}