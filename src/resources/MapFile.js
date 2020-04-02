import { Box } from '../geo/Box.js';
import DefaultMaterial from '../materials/DefaultMaterial.js';
import { Material } from '../materials/Material.js';
import MattMaterial from '../materials/MattMaterial.js';
import { Texture } from '../materials/Texture.js';
import { Geometry } from '../scene/Geometry.js';
import Prop from '../scene/Prop.js';
import { Scene } from '../scene/Scene.js';
import { BinaryFile } from './BinaryFile.js';
import { Group } from '../geo/Group.js';

const Structs = {
    fileHeader: {
        version: 'int',
        objectsOffset: 'int',
        objectsCount: 'int',
        materialCount: 'int',
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
        indecies: 'int[indeciesLength]',
        vertecies: 'float[verteciesLength]',
        hitbox: 'float[5]',
        materialCount: 'int',
        materials: 'int[materialCount]'
    },
    material: {
        type: 'unsigned char',
        diffuseColor: 'float[4]',
        materialValues: 'float[4]',
        castShadows: 'byte',
        drawmode: 'unsigned char',
        
        textureLength: 'int',
        specularMapLength: 'int',
        displacementMapLength: 'int',
        normalMapLength: 'int',
    },
}

const stringToCharArray = str => {
    let arr = [];
    if(str) {
        arr = str.split('').map(s => s.charCodeAt(0));
    }
    arr.push(0x00);
    return arr;
}

let tempMaterialStore = [];

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

        return {
            byteOffset,
            data: objects
        };
    }

    static unserializeMaterials(map, offset, materialCount) {
        const materials = [];
        let byteOffset = offset;

        for(let i = 0; i < materialCount; i++) {
            const material = this.unserialize(map.view, byteOffset, Structs.material);
            byteOffset = material.byteOffset;

            material.data.texture = map.buffer.slice(byteOffset, byteOffset += material.data.textureLength.data);
            material.data.specularMap = map.buffer.slice(byteOffset, byteOffset += material.data.specularMapLength.data);
            material.data.displacementMap = map.buffer.slice(byteOffset, byteOffset += material.data.displacementMapLength.data);
            material.data.normalMap = map.buffer.slice(byteOffset, byteOffset += material.data.normalMapLength.data);

            materials.push(material.data);
        }

        return {
            byteOffset,
            data: materials
        };
    }

    static unserializeTextureImageData(imageData) {
        return new Promise((resolve, reject) => {
            if(imageData.byteLength == 0) {
                return null;
            }
    
            const blob = new Blob([ imageData ], { type: "image/jpeg" });
    
            const img = new Image();
            img.src = URL.createObjectURL(blob);

            img.onload = () => {
                resolve(new Texture(img));
            }
        })
    }

    static fromDataArray(dataArray) {
        const map = this.createFile(dataArray);
        map.header = this.unserialize(map.view, 0, Structs.fileHeader);

        const objectsCount = map.header.data.objectsCount.data;
        const objects = this.unserializeObjects(map, map.header.byteOffset, objectsCount);
        map.objects = objects.data;
        
        const materialCount = map.header.data.materialCount.data;
        const materials = this.unserializeMaterials(map, objects.byteOffset, materialCount);
        map.materials = materials.data;

        return map;
    }

    toScene() {
        const objects = this.objects;
        const materials = this.materials;

        const scene = new Scene();

        const materialTypes = MapFile.MATERIAL_TYPES;

        const materialPool = [];

        for(let material of materials) {
            const type = material.type.data || "DefaultMaterial";

            if(!(type in materialTypes)) {
                console.warn('Material type "' + type + '" does not exist.');
                continue;
            }

            const mat = new materialTypes[type]({
                diffuseColor: material.diffuseColor.data,
                materialAttributes: material.materialValues.data,
                castShadows: material.castShadows.data,
                drawmode: material.drawmode.data,
            })

            const texture = MapFile.unserializeTextureImageData(material.texture);
            const specularMap = MapFile.unserializeTextureImageData(material.specularMap);
            const displacementMap = MapFile.unserializeTextureImageData(material.displacementMap);
            const normalMap = MapFile.unserializeTextureImageData(material.normalMap);

            texture.then(tex => { mat.texture = tex; mat.update(); });
            specularMap.then(tex => { mat.specularMap = tex; mat.update(); });
            displacementMap.then(tex => { mat.displacementMap = tex; mat.update(); });
            normalMap.then(tex => { mat.normalMap = tex; mat.update(); });
            
            materialPool.push(mat);
        }

        for(let obj of objects) {
            const indecies = obj.indecies.data;
            let struct = Prop.map.get(obj.type.data);

            if(!struct) {
                console.error('Unknown object type "' + obj.type.data + '" skipped.');
                continue;
            }

            if(struct == Box) {
                struct = Geometry;
            }

            const geo = new struct({
                materials: obj.materials.data.map(mat => materialPool[mat]),
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

    static async serializeScene(scene) {
        const objects = [];
        const sceneGraph = scene.getSceneGraph();

        const flattenChildren = item => {
            const flattenObjects = [];

            if(item.object.indecies.length > 0) {
                objects.push(item.object);
            } else {
                flattenObjects.push(item.object);
            }

            for(let childItem of item.children) {
                const childChildren = flattenChildren(childItem);
                flattenObjects.push(...childChildren);
            }

            return flattenObjects;
        }

        for(let item of sceneGraph) {
            if(item.children.length > 0) {
                const grouping = new Group();
                grouping.add(...flattenChildren(item));

                // vertecies getter to fill the materials attribute before collection materials
                if(grouping.vertecies.length > 0) {
                    objects.push(grouping);
                }
            } else {
                objects.push(item.object);
            }
        }

        const objectData = [];

        let objectCount = 0;
        let materialCount = 0;
        
        for(let object of objects) {
            if(!object.guide) {
                tempMaterialStore.push(...object.materials);
            }
        }

        for(let object of objects) {
            if(!object.guide) {
                const data = this.serializeObject(object);
                objectData.push(...data);
                objectCount++;
            }
        }

        const materialsData = [];

        for(let mat of tempMaterialStore) {
            const materialData = await this.serializeMaterial(mat);
            materialsData.push(...materialData);
            materialCount++;
        }

        const fileData = [ objectData, materialsData ];

        const hedaer = new Uint32Array([
            this.version,
            0,
            objectCount,
            materialCount,
        ]);

        const bufferData = [ hedaer, ...fileData.flat() ];
        
        return new Blob(bufferData, { type: 'application/octet-stream' });
    }

    static getMaterialIndex(material) {
        return tempMaterialStore.indexOf(material);
    }

    static serializeObject(object) {
        if(!object.constructor.type) {
            return [];
        }

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

        const materialCount = new Uint32Array([ object.materials.length ]);
        const materials = new Uint32Array(object.materials.map(mat => this.getMaterialIndex(mat)));

        let type = stringToCharArray(object.constructor.type);

        if(object.constructor.type == "geometry_group") {
            type = stringToCharArray("geometry");
        }

        return [ 
            new Uint8Array(type),
            new Uint32Array([
                vertecies.byteLength / Float32Array.BYTES_PER_ELEMENT,
                indecies.byteLength / Uint32Array.BYTES_PER_ELEMENT,
            ]), 
            position, 
            rotation, 
            scale, 
            indecies, 
            vertecies, 
            hitbox,
            materialCount,
            materials,
        ];
    }

    static async serializeMaterial(material) {
        const diffuseColor = new Float32Array([
            material.diffuseColor[0],
            material.diffuseColor[1],
            material.diffuseColor[2],
            material.diffuseColor[3],
        ]);
        const materialValues = new Float32Array(material.materialAttributes);
        const castShadows = new Uint8Array([material.castShadows ? 1 : 0]);
        const drawmode = stringToCharArray(material.drawmode);

        const texture = await this.serializeTexture(material.texture);
        const specularMap = await this.serializeTexture(material.specularMap);
        const displacementMap = await this.serializeTexture(material.displacementMap);
        const normalMap = await this.serializeTexture(material.normalMap);

        const type = stringToCharArray(material.constructor.name);

        return [ 
            new Uint8Array(type),
            diffuseColor,
            materialValues,
            castShadows,
            new Uint8Array(drawmode),

            new Uint32Array([
                texture.byteLength,
                specularMap.byteLength,
                displacementMap.byteLength,
                normalMap.byteLength,
            ]),
            
            new Uint8Array(texture),
            new Uint8Array(specularMap),
            new Uint8Array(displacementMap),
            new Uint8Array(normalMap),
        ];
    }

    static serializeTexture(texture) {
        return new Promise((resolve, reject) => {
            if(!texture) {
                resolve(new ArrayBuffer(0));
                return;
            }

            const img = texture.image;
            
            if(img) {
                const ctx = document.createElement('canvas').getContext("2d");

                ctx.canvas.width = img.width;
                ctx.canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                ctx.canvas.toBlob(blob => {
                    blob.arrayBuffer().then(arrayBuffer => resolve(arrayBuffer));
                }, 'image/png');
            } else {
                resolve(new ArrayBuffer(0));
            }
        })
    }

}

MapFile.MATERIAL_TYPES = {
    Material: Material,
    DefaultMaterial: DefaultMaterial,
    MattMaterial: MattMaterial
};
