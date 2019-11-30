export default  {

    onCreate: (entity) => {
        entity.airborn = true;
        entity.collider = true;
    },

    onUpdate: (entity, ms) => {
        for(let collider of entity.intersections) {

            const top1 = entity.hitbox[0] + entity.position.y;
            const right1 = entity.hitbox[1] + entity.position.x;
            const bottom1 = entity.hitbox[2] + entity.position.y;
            const left1 = entity.hitbox[3] + entity.position.x;

            const top2 = collider.hitbox[0] + collider.position.y;
            const right2 = collider.hitbox[1] + collider.position.x;
            const bottom2 = collider.hitbox[2] + collider.position.y;
            const left2 = collider.hitbox[3] + collider.position.x;
    
            // right edge
            // if (right1 > left2 && top1 < top2 && top1 > bottom2) {
            //     entity.velocity.x = -entity.velocity.x / 10;
            //     entity.position.x = right2 + collider.hitbox[2];
            // }

            // bottom edge
            if (bottom1 < top2 && left1 > left2 && left1 < right2) {
                entity.velocity.y = -entity.velocity.y / 10;
                entity.position.y = top2;
                entity.airborn = false;
            }
        }

    }

}