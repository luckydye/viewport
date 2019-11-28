export default  {

    onCreate: (entity) => {
        
    },

    onUpdate: (entity, ms) => {
        entity.velocity.y -= 0.0009;
    }

}