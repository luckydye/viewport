import { uuidv4 } from '../Math.js';

const PLACEHOLDER = new Image();
PLACEHOLDER.src = "/res/textures/placeholder.png";

export class Texture {

    static get PLACEHOLDER() {
        return PLACEHOLDER;
    }

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
        this.animated = false;

        this.type = "TEXTURE_2D";

        this.wrap_s = "REPEAT";
        this.wrap_t = "REPEAT";

        this.mag_filter = "LINEAR";
        this.min_filter = "NEAREST_MIPMAP_LINEAR";

        if(image instanceof ArrayBuffer) {
            this.format = format;
            this.data = image;
        } else {
            this.image = image;
            this.animated = image && image.localName === "video" || this.animated;
        }
    }

}
