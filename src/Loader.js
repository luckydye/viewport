import { Material } from "./materials/Material";
import { Resources } from "./Resources";
import { Texture } from "./materials/Texture";
import { Logger } from "./Logger";
import { Scene } from "./scene/Scene";

import * as Geometry from './geo/*.*';
import * as Camera from './camera/*.*';
import * as Light from './light/*.*';

const logger = new Logger('Loader');

export class Loader {

    static loadScene(json, camera) {
        const objects = [
            ...json.objects,
            ...json.cameras,
        ];
        const scene = new Scene(camera);

        for(let obj of objects) {

            let Category = Geometry;

            if(obj.type in Geometry) Category = Geometry;
            if(obj.type in Light) Category = Light;
            if(obj.type in Camera) Category = Camera;

            if(obj.type == 'Cursor' || obj.type == 'Grid') continue;

            let geo = new Category[obj.type].js[obj.type];
            geo = Object.assign(geo, obj);
            scene.add(geo);

            if(obj.type in Camera) {
                scene.activeCamera = geo;
            }
        }
        return scene;
    }

    static saveScene(scene) {
        const objects = [...scene.objects];
        const camera = scene.activeCamera;

        const json = {
            cameras: [
                {
                    type: camera.constructor.name,
                    position: camera.position,
                    rotation: camera.rotation,
                    fov: camera.fov,
                    scale: camera.scale,
                }
            ],
            objects: [
                ...objects.map(obj => {
                    return {
                        type: obj.constructor.name,
                        position: obj.position,
                        rotation: obj.rotation,
                        scale: obj.scale,
                        id: obj.id,
                    }
                })
            ],
            animation: [

            ]
        };

        return json;
    }

    static loadObjFile(objFile) {
        const vertecies = [];

        let face = null;
        let fface = null;

        try {
            objFile.faces.forEach((f, i) => {
                for(let i = 0; i < 3; i++) {
                    fface = f;
                    face = f[i];

                    const vertex = objFile.vertecies[face[0]-1];
                    const uv = objFile.uvs[face[1]-1];
                    const normal = objFile.normals[face[2]-1];

                    if(vertex && uv && normal) {
                        vertecies.push(
                            vertex[0],
                            vertex[1],
                            vertex[2],

                            uv[0],
                            uv[1],

                            normal[0],
                            normal[1],
                            normal[2],
                        );
                    }
                }
                if(f.length > 3) {
                    [2, 3, 0].forEach(i => {
                        face = f[i];
        
                        const vertex = objFile.vertecies[face[0]-1];
                        const uv = objFile.uvs[face[1]-1];
                        const normal = objFile.normals[face[2]-1];
        
                        if(vertex && uv && normal) {
                            vertecies.push(
                                vertex[0],
                                vertex[1],
                                vertex[2],
        
                                uv[0],
                                uv[1],
        
                                normal[0],
                                normal[1],
                                normal[2],
                            );
                        }
                    })
                }
            });

        } catch(err) {
            console.error(face, fface);
            console.error(err);
        }

        
        return vertecies;
    }

    static createMatFromJson(name, json) {
        const mat = new Material(name);

        Object.assign(mat, json);

        if(json.texture) {
            const texImage = Resources.get(json.texture);
            const texture = new Texture(texImage);
            mat.texture = texture;

            if(!texImage) {
                logger.error('could not find texture on Material', name);
            }
        }

        if(json.reflectionMap) {
            const reflectionImage = Resources.get(json.reflectionMap);
            const reflectionTexture = new Texture(reflectionImage);
            mat.reflectionMap = reflectionTexture;

            if(!reflectionImage) {
                logger.error('could not find reflectionMap on Material', name);
            }
        }

        if(json.displacementMap) {
            const displacementImage = Resources.get(json.displacementMap);
            const displacementMap = new Texture(displacementImage);
            mat.displacementMap = displacementMap;

            if(!displacementImage) {
                logger.error('could not find displacementMap on Material', name);
            }
        }

        return mat;
    }

}
