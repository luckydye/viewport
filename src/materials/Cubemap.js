import { Texture } from "./Texture";

export class Cubemap extends Texture {

    type = "TEXTURE_CUBE_MAP";

    width = 1920;
    height = 1920;
    
    image = [];

}
