import { Camera } from './Camera';

export class StereoCamera extends Camera {

    get view() {
        return this.cam;
    }

    constructor(args) {
        super(args);

        this.cam = [
            new Camera(this),
            new Camera(this),
        ];

        this.cam[0].parent = this;
        this.cam[0].position.x = -0.05;

        this.cam[1].parent = this;
        this.cam[1].position = this;
        this.cam[1].position.x = 0.05;
    }

}