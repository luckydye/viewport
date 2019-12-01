import DefaultMaterial from '../materials/DefaultMaterial';
import { Camera } from '../scene/Camera';
import { Entity } from '../scene/Entity';
import { PlayerEntity } from '../scene/PlayerEntity';
import { Geometry } from '../scene/Geometry';
import { Scene } from '../scene/Scene';
import { BinaryFile } from './BinaryFile';
import { Cube } from '../geo/Cube';
import { Plane } from '../geo/Plane';
import { Guide } from '../geo/Guide';
import { Box } from '../geo/Box';

const Structs = {
    fileHeader: {
        version: 'int',
        objectsOffset: 'int',
        objectsCount: 'int',
    },
    object: {
        // header
        type: 'unsigned char',
        verteciesLength: 'int',
        indeciesLength: 'int',
        // data
        position: 'vector',
        rotation: 'vector',
        scale: 'float',
        vertecies: 'float[verteciesLength]',
        indecies: 'int[indeciesLength]',
        hitbox: 'float[5]',
    },
}

// scene header
// - version
// - object array offset
// - object count

// object header
// - position offset after header
// - rotation offset after header
// - scale offset after header
// - indecies offset after header
// - indecies byte length
// - vertecies offset after header
// - vertecies byte length

const toOffset = (arr, fileData) => {
    const index = fileData.indexOf(arr);
    return fileData.reduce((acc, data, i) => (i < index ? acc + data.byteLength : acc), 0);
}

export default class MapFile extends BinaryFile {

    static get version() {
        return 1;
    }

    static get STRUCT() {
        return Structs;
    }

    static unserializeObjects(map, offset, objectCount) {
        const objects = [];
        let byteOffset = offset;

        for(let i = 0; i < objectCount; i++) {
            const object = this.unserialize(map.view, byteOffset, Structs.object);
            byteOffset = object.byteOffset;
            objects.push(object.data);
        }

        return objects;
    }

    static fromDataArray(dataArray) {
        const map = this.createFile(dataArray);
        map.header = this.unserialize(map.view, 0, Structs.fileHeader);

        const objectsCount = map.header.data.objectsCount.data;
        map.objects = this.unserializeObjects(map, map.header.byteOffset, objectsCount);

        return map;
    }

    toScene() {
        const objects = this.objects;

        const scene = new Scene();

        const objectTypes = MapFile.OBJECT_TYPES;

        for(let obj of objects) {
            const indecies = obj.indecies.data;
            const struct = objectTypes[obj.type.data];

            if(!struct) {
                console.error('Unknown object type "' + obj.type.data + '" skipped.');
                continue;
            }

            const geo = new struct({
                material: new DefaultMaterial(),
                hitbox: obj.hitbox.data,
                vertecies: obj.vertecies.data,
                indecies: indecies.length > 0 ? indecies : null,
                position: [
                    obj.position.data[0].data,
                    obj.position.data[1].data,
                    obj.position.data[2].data,
                    0
                ],
                rotation: [
                    obj.rotation.data[0].data,
                    obj.rotation.data[1].data,
                    obj.rotation.data[2].data,
                    0
                ],
                scale: obj.scale.data
            });

            scene.add(geo);
        }

        return scene;
    }

    static serializeScene(scene) {
        const objects = [...scene.objects];

        const objectData = [];
        let objectCount = 0;

        for(let object of objects) {
            if(!(object instanceof Camera)) {
                const data = this.serializeObject(object);
                objectData.push(...data);
                objectCount++;
            }
        }

        // TODO:
        // materials

        const fileData = [ objectData ];

        const hedaer = new Uint32Array([
            this.version,
            toOffset(objectData, fileData),
            objectCount,
        ]);

        const bufferData = [ hedaer, ...fileData.flat() ];
        return new Blob(bufferData, { type: 'application/octet-stream' });
    }

    static serializeObject(object) {
        const position = new Float32Array([object.position.x, object.position.y, object.position.z]);
        const rotation = new Float32Array([object.rotation.x, object.rotation.y, object.rotation.z]);
        const scale = new Float32Array([object.scale]);
        const vertecies = new Float32Array(object.vertecies);
        const indecies = new Uint32Array(object.indecies);
        const hitbox = new Float32Array([
            object.hitbox ? object.hitbox[0] : 0,
            object.hitbox ? object.hitbox[1] : 0,
            object.hitbox ? object.hitbox[2] : 0,
            object.hitbox ? object.hitbox[3] : 0,
            object.hitbox ? object.hitbox[4] : 0,
        ]);

        // TODO:
        // materials

        const fileData = [ position, rotation, scale, indecies, vertecies, hitbox ];

        const type = object.constructor.name.split('').map(s => s.charCodeAt(0));
        type.push(0x00);

        return [ 
            new Uint8Array(type),
            new Uint32Array([
                vertecies.byteLength / Float32Array.BYTES_PER_ELEMENT,
                indecies.byteLength / Uint32Array.BYTES_PER_ELEMENT,
            ]), 
            ...fileData
        ];
    }

}

MapFile.OBJECT_TYPES = {
    PlayerEntity: PlayerEntity,
    Cube: Cube,
    Plane: Plane,
    Guide: Guide,
    Box: Box,
    Geometry: Geometry,
    Entity: Entity
};
