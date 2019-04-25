export class Texture {

    get image() {
        return this.img;
    }

    set image(image) {
        this.img = image;
    }

    get width() {
        return this.image.width;
    }

    get height() {
        return this.image.height;
    }

    gltexture = null; // gets filled in by the renderer
    animated = false;
    textureScale = 1;

    constructor(image) {
        this.image = image || null;
        this.animated = image && image.localName === "video" || this.animated;
    }

}
