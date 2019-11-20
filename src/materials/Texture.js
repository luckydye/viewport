import { uuidv4 } from '../Math';

export class Texture {

    get width() { return this.image.width; }
    get height() { return this.image.height; }

    get isTexture() {
        return true;
    }

    constructor(image) {

        this.uid = uuidv4();

        this.type = "TEXTURE_2D";
        this.animated = false;

        this.image = image;
        this.animated = image && image.localName === "video" || this.animated;
    }

}
