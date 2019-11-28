export default  {

    onCreate: (entity) => {
        entity.airborn = true;
    },

    onUpdate: (entity, ms) => {
        if(entity.position.y <= 0) {
            entity.position.y = 0;
            entity.velocity.y = -entity.velocity.y / 10;
            entity.airborn = false;
        }
    }

}