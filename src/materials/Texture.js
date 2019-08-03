export class Texture {

    static get EMPTY() {
        return emptyTexture;
    }

    get width() { return this.image.width; }
    get height() { return this.image.height; }

    constructor(image) {

        this.type = "TEXTURE_2D";
        this.gltexture = null; // gets filled in by the renderer
        this.animated = false;

        this.image = image;
        this.animated = image && image.localName === "video" || this.animated;
    }

}

const emptyTexture = new Texture(document.createElement('canvas'));
