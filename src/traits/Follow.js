export default {

    onCreate: (entity) => {
        
    },

    onUpdate: (entity, ms) => {
        if(entity.followed) {

            entity.velocity.x = -entity.followed.position.x - entity.position.x;
            entity.velocity.y = -entity.followed.position.y - entity.position.y;
            // entity.velocity.z = -entity.followed.position.z - entity.position.z;

            entity.velocity.x *= 0.01;
            entity.velocity.y *= 0.0033;
            entity.velocity.z *= 0.0033;
        }
    },

    methods: {
        follow(entity) {
            this.followed = entity;
        }
    },

}
