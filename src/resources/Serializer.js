export class Serializer {

    static serializeScene(scene) {
        const objects = [...scene.objects];

        for(let object of objects) {
            console.log(object);
        }
    }

    

}