import { uuidv4 } from '../Math';

export class Texture {

    get width() { 
        return this.image ? this.image.width : this.format.width;
    }

    get height() { 
        return this.image ? this.image.height : this.format.height;
    }

    get isTexture() {
        return true;
    }

    constructor(image, format = { type: "RAW" }) {

        this.uid = uuidv4();

        this.type = "TEXTURE_2D";
        this.animated = false;

        if(image instanceof ArrayBuffer) {
            this.format = format;
            this.data = image;
        } else {
            this.image = image;
            this.animated = image && image.localName === "video" || this.animated;
        }
    }

}
