import { Material } from "./materials/Material";
import { Resources } from "./Resources";
import { Texture } from "./materials/Texture";
import { Logger } from "./Logger";
import { Mesh } from "./geo/Mesh";
import TestMaterial from "./materials/TestMaterial";

const logger = new Logger('Loader');

export class Loader {

    static createMeshFromObjFile(objFile) {
        const indecies = [];
        const uvs = [];
        const vertecies = [];

        console.log(objFile);

        objFile.faces.forEach((f, i) => {
            for(let i = 0; i < 3; i++) {
                indecies.push(f[i][0] - 1);
                uvs.push(f[i][1] - 1);
            }
        });

        objFile.vertecies.forEach((v, i) => {
            vertecies.push(...v, uvs[i][0], uvs[i][1]);
        });
        
        const mesh = new Mesh({
            drawmode: 'TRIANGLES',
            material: new TestMaterial(),
            scale: 100,
            vertecies: vertecies,
            indecies: indecies,
            uvs: uvs
        });
        return mesh;
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
