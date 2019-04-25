import { Material } from "./materials/Material";
import { Resources } from "./Resources";
import { Texture } from "./materials/Texture";
import { Logger } from "./Logger";

const logger = new Logger('Loader');

export class Loader {

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
