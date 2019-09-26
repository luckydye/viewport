import { uuidv4 } from '../Math';

export class Texture {

    static get EMPTY() {
        return new Texture();
    }

    get width() { return this.image.width; }
    get height() { return this.image.height; }

    constructor(image) {

        this.uid = uuidv4();

        this.type = "TEXTURE_2D";
        this.animated = false;

        this.image = image;
        this.animated = image && image.localName === "video" || this.animated;
    }

}
