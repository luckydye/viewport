
const toOffset = (arr, fileData) => {
    const index = fileData.indexOf(arr);
    return fileData.reduce((acc, data, i) => (i < index ? acc + data.byteLength : acc), 0);
}

export class Serializer {

    static get version() {
        return 1;
    }

    // scene header
    // - version
    // - object array offset
    // - object count

    static serializeScene(scene) {
        const objects = [...scene.objects];

        const objectData = [];

        for(let object of objects) {
            const data = this.serializeObject(object);
            objectData.push(...data);
        }

        const fileData = [ objectData ];

        const hedaer = new Uint32Array([
            this.version,
            toOffset(objectData, fileData),
            objects.length,
        ]);

        const bufferData = [ hedaer, ...fileData.flat() ];
        const dataBlob = new Blob(bufferData, { type: 'application/octet-stream' });
        
        console.log(dataBlob);

        // deserialize test
        dataBlob.arrayBuffer().then(res => {
            return this.deserializeScene(res);
        });
    }

    // object header
    // - position offset after header
    // - rotation offset after header
    // - scale offset after header
    // - indecies offset after header
    // - indecies byte length
    // - vertecies offset after header
    // - vertecies byte length

    static serializeObject(object) {
        const position = new Float32Array([object.position.x, object.position.y, object.position.z]);
        const rotation = new Float32Array([object.rotation.x, object.rotation.y, object.rotation.z]);
        const scale = new Float32Array([object.scale]);
        const vertecies = new Float32Array(object.vertecies);
        const indecies = new Uint32Array(object.indecies);

        // TODO:
        // material

        const fileData = [ position, rotation, scale, indecies, vertecies ];

        const hedaer = new Uint32Array([
            toOffset(position, fileData),
            toOffset(rotation, fileData),
            toOffset(scale, fileData),
            toOffset(indecies, fileData),
            indecies.byteLength,
            toOffset(vertecies, fileData),
            vertecies.byteLength,
        ]);

        return [ hedaer, ...fileData ];
    }

    static deserializeScene(dataArray) {
        const view = new DataView(dataArray);

        const headerByteLength = Uint32Array.BYTES_PER_ELEMENT * 3;
        const header = {
            version: view.getUint32(0, true),
            objectsOffset: view.getUint32(1 * Uint32Array.BYTES_PER_ELEMENT, true),
            objectsCount: view.getUint32(2 * Uint32Array.BYTES_PER_ELEMENT, true),
        }
        const objects = [];

        let byteOffset = 0;

        for(let c = 0; c < header.objectsCount; c++) {
            const index = headerByteLength + header.objectsOffset + byteOffset;
            const object = this.deserializeObject(view, index);
            byteOffset += object.byteLength;
            objects.push(object);
        }

        console.log(header);
        console.log(objects);
    }

    static deserializeObject(dataView, index) {

        const header = {
            positionOffset: dataView.getUint32(index + 0, true),
            rotationOffset: dataView.getUint32(index + (1 * Uint32Array.BYTES_PER_ELEMENT), true),
            scaleOffset: dataView.getUint32(index + (2 * Uint32Array.BYTES_PER_ELEMENT), true),
            indeciesOffset: dataView.getUint32(index + (3 * Uint32Array.BYTES_PER_ELEMENT), true),
            indeciesLength: dataView.getUint32(index + (4 * Uint32Array.BYTES_PER_ELEMENT), true),
            verteciesOffset: dataView.getUint32(index + (5 * Uint32Array.BYTES_PER_ELEMENT), true),
            verteciesLength: dataView.getUint32(index + (6 * Uint32Array.BYTES_PER_ELEMENT), true),
        }

        const byteLength = (7 * Uint32Array.BYTES_PER_ELEMENT) 
                            + 3 * Float32Array.BYTES_PER_ELEMENT
                            + 3 * Float32Array.BYTES_PER_ELEMENT
                            + 1 * Float32Array.BYTES_PER_ELEMENT
                            + header.verteciesLength 
                            + header.indeciesLength;

        return { byteLength, header };
    }

}