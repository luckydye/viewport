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

    constructor(image) {
        this.gltexture = null; // gets filled in by the renderer
        this.image = image || null;
        this.scale = 16;
        this.animated = false;
        
        this.animated = image && image.localName === "video" || false;
    }

}
