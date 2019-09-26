export class Texture {

    static get EMPTY() {
        return new Texture();
    }

    get width() { return this.image.width; }
    get height() { return this.image.height; }

    constructor(image) {

        this.type = "TEXTURE_2D";
        this.gltexture = null;
        this.animated = false;

        this.image = image;
        this.animated = image && image.localName === "video" || this.animated;
    }

}
