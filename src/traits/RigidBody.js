export default  {

    onCreate: (entity) => {
        
    },

    onUpdate: (entity, ms) => {
        entity.velocity.x *= 0.925;
        entity.velocity.z *= 0.925;
        entity.velocity.y -= 0.01;
    }

}