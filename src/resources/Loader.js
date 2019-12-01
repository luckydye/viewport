import { Material } from "../materials/Material.js";
import { Texture } from "../materials/Texture.js";
import { Resources } from "../resources/Resources.js";
import { Geometry } from '../scene/Geometry.js';
import { Scene } from "../scene/Scene.js";

export class Loader {

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
                            0,

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

}
