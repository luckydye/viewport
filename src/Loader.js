import { Material } from "./materials/Material.js";
import { Resources } from "./Resources.js";
import { Texture } from "./materials/Texture.js";
import { Logger } from "./Logger.js";
import { Scene } from "./scene/Scene.js";
import { vec3 } from 'gl-matrix';
import { Geometry } from './scene/Geometry.js';
import DefaultMaterial from './materials/DefaultMaterial.js';
import { Plane } from './geo/Plane.js';
import { Group } from './geo/Group.js';

// import * as Geometry from './geo/*.*';
// import * as Camera from './camera/*.*';
// import * as Light from './light/*.*';

const logger = new Logger('Loader');

export class Loader {

    static loadScene(json, camera) {
        const objects = [
            ...json.objects,
            ...json.cameras,
        ];
        const scene = new Scene(camera);

        for (let obj of objects) {

            let Category = Geometry;

            if (obj.type in Geometry) Category = Geometry;
            if (obj.type in Light) Category = Light;
            if (obj.type in Camera) Category = Camera;

            if (obj.type == 'Cursor' || obj.type == 'Grid') continue;

            let geo = new Category[obj.type].js[obj.type];
            geo = Object.assign(geo, obj);
            scene.add(geo);

            if (obj.type in Camera) {
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

        if (!objFile) return;

        try {
            objFile.faces.forEach((f, i) => {
                for (let i = 0; i < 3; i++) {
                    fface = f;
                    face = f[i];

                    const vertex = objFile.vertecies[face[0] - 1];
                    const uv = objFile.uvs[face[1] - 1];
                    const normal = objFile.normals[face[2] - 1];

                    if (vertex && normal) {
                        vertecies.push(
                            vertex[0],
                            vertex[1],
                            vertex[2],

                            uv ? uv[0] : 0,
                            uv ? uv[1] : 0,
                            fface.material,

                            normal[0],
                            normal[1],
                            normal[2],
                        );
                    }
                }
                if (f.length > 3) {
                    [2, 3, 0].forEach(i => {
                        face = f[i];

                        const vertex = objFile.vertecies[face[0] - 1];
                        const uv = objFile.uvs[face[1] - 1];
                        const normal = objFile.normals[face[2] - 1];

                        if (vertex && uv && normal) {
                            vertecies.push(
                                vertex[0],
                                vertex[1],
                                vertex[2],

                                uv[0],
                                uv[1],
                                fface.material,

                                normal[0],
                                normal[1],
                                normal[2],
                            );
                        }
                    })
                }
            });

        } catch (err) {
            console.error(err);
        }

        return vertecies;
    }

    static loadBspFile(bspFile) {
        console.log(bspFile);

        const meshData = bspFile.convertToMesh();

        const vertexData = {
            vertecies: meshData.vertecies.map(vert => ([
                ...vert.vertex,
                ...vert.uv,
                ...vert.normal
            ])).flat(),
            indecies: meshData.indecies
        };
        
        const geometry = [];

        // enitites
        const entityMaterial = new DefaultMaterial();
        const entityGroup = new Group();
        for(let entity of bspFile.entities) {
            if(entity.origin) {
                entityGroup.add(new Plane({
                    material: entityMaterial,
                    position: [
                        entity.origin[0] * -0.01,
                        entity.origin[2] * 0.01,
                        entity.origin[1] * 0.01,
                    ],
                    scale: [0.2, 0.2, 0.2],
                }));
            }
        }
        geometry.push(entityGroup);

        // props
        const propsMaterial = new DefaultMaterial();
        const propsGroup = new Group();

        for(let props of bspFile.gamelumps.sprp) {
            if(props.Origin) {
                propsGroup.add(new Plane({
                    material: propsMaterial,
                    position: [
                        props.Origin[0] * -0.01,
                        props.Origin[2] * 0.01,
                        props.Origin[1] * 0.01,
                    ],
                    scale: [0.2, 0.2, 0.2],
                }));
            }
        }
        geometry.push(propsGroup);

        const map = new Geometry({
            vertecies: vertexData.vertecies,
            indecies: vertexData.indecies,
            material: new DefaultMaterial(),
            scale: [-0.01, 0.01, 0.01],
            rotation: [0, 0, 0],
            position: [0, 0, 0],
        });

        geometry.push(map);

        return geometry;
    }

    static createMatFromJson(name, json) {
        const mat = new Material(name);

        Object.assign(mat, json);

        if (json.texture) {
            const texImage = Resources.get(json.texture);
            const texture = new Texture(texImage);
            mat.texture = texture;

            if (!texImage) {
                logger.error('could not find texture on Material', name);
            }
        }

        if (json.specularMap) {
            const reflectionImage = Resources.get(json.specularMap);
            const reflectionTexture = new Texture(reflectionImage);
            mat.specularMap = reflectionTexture;

            if (!reflectionImage) {
                logger.error('could not find specularMap on Material', name);
            }
        }

        if (json.displacementMap) {
            const displacementImage = Resources.get(json.displacementMap);
            const displacementMap = new Texture(displacementImage);
            mat.displacementMap = displacementMap;

            if (!displacementImage) {
                logger.error('could not find displacementMap on Material', name);
            }
        }

        return mat;
    }

}
