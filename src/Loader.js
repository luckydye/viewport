import { Material } from "./materials/Material";
import { Resources } from "./Resources";
import { Texture } from "./materials/Texture";
import { Logger } from "./Logger";
import { Mesh } from "./geo/Mesh";

const logger = new Logger('Loader');

export class Loader {

    static createMeshFromObj(data) {
        const mesh = new Mesh();
        
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
