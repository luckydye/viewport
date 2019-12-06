export default  {

    onCreate: (entity) => {
        entity.weight = 2;
    },

    onUpdate: (entity, ms) => {
        entity.velocity.x *= 0.98;
        entity.velocity.y -= 0.01;
        entity.velocity.z *= 0.98;
    }

}