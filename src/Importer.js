import { Material } from "./gl/graphics/Material.js";
import { Resources } from "./gl/Resources.js";
import { Texture } from "./gl/graphics/Texture.js";
import { Logger } from "./Logger.js";

const logger = new Logger('Importer');

export class Importer {

    static createMatFromJson(name, json) {
        const mat = Material.create(name);

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
