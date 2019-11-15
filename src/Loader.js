import { Material } from "./materials/Material.js";
import { Resources } from "./Resources.js";
import { Texture } from "./materials/Texture.js";
import { Logger } from "./Logger.js";
import { Scene } from "./scene/Scene.js";
import { vec3 } from 'gl-matrix';

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

        const planes = bspFile.planes;
        const edges = bspFile.edges;
        const surfedges = bspFile.surfedges;
        const vertecies = bspFile.vertecies;

        const faces = bspFile.faces;

        const vertexResultArray = [];
        const indexResultArray = [];

        let currentVertexIndex = 0;

        for(let face of faces) {
            const plane = planes[face.planenum];

            const faces = face.side;
            const normal = plane.normal;

            const faceSurfedges = surfedges.slice(face.firstedge, face.firstedge + face.numedges);

            const faceEdges = faceSurfedges.map(surfEdge => {
                let edge = edges[Math.abs(surfEdge.edge)].v;
                if(surfEdge.edge < 0) {
                    edge = edge.reverse();
                }
                return edge;
            });

            const verts = [];
            const indexes = [];

            for(let edge of faceEdges) {
                let vertIndecies = edge;
                verts.push(vertecies[vertIndecies[0]]);
            }

            const numberOfIndecies = (verts.length - 2) * 3;

            for(let i = 0; i < numberOfIndecies / 3; i++) {
                indexes.push(currentVertexIndex + 0);
                indexes.push(currentVertexIndex + 1 + i);
                indexes.push(currentVertexIndex + 2 + i);
            }

            currentVertexIndex += verts.length;

            const parsedVertecies = verts.map(v => [
                v.x, v.z, v.y, 
                0, 1, 0, 
                normal[0], normal[2], normal[1]
            ]);

            vertexResultArray.push(...parsedVertecies.flat());
            indexResultArray.push(...indexes.flat());
        }

        return {
            indecies: indexResultArray,
            vertecies: vertexResultArray
        };
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
