export class Texture {

    get width() { return this.image.width; }
    get height() { return this.image.height; }

    type = "TEXTURE_2D";
    gltexture = null; // gets filled in by the renderer
    
    animated = false;

    constructor(image) {
        this.image = image;
        this.animated = image && image.localName === "video" || this.animated;
    }

}
