import { Vec } from "./Math";

export class Animation {

    constructor() {
        this.keyframes = [];

        this.duration = 2000;
        this.framerate = 60;

        this.loop = true;
        this.playing = false;

        this.lasttick = 0;

        this.reset();
    }

    reset() {
        this.time = 0;
        this.accumulator = 0;
    }

    stop() {
        this.playing = false;
    }

    play(target) {
        this.playing = true;

        const keyframes = this.keyframes.length;

        const tickAnimation = (ms = 0) => {
            if(this.playing) {
                requestAnimationFrame(tickAnimation);
            }

            const deltaTime = ms - this.lasttick;

            this.accumulator += deltaTime;
            this.time += deltaTime;
            this.lasttick = ms;

            if(this.time >= this.duration) {
                this.reset();

                if(!this.loop) 
                    this.stop();
            }

            if(this.accumulator > 1000 / this.framerate) {
                this.accumulator = 0;

                const frameTime = Math.floor(this.duration / (keyframes-1));
                const currentKeyframe = this.time / frameTime;

                const lastKeyframe = this.keyframes[Math.floor(currentKeyframe)];
                const nextKeyframe = this.keyframes[Math.floor(currentKeyframe)+1];

                const progress = currentKeyframe - Math.floor(currentKeyframe);
                this.applyAnimation(target, lastKeyframe, nextKeyframe, progress);
            }
        }

        if(keyframes > 1) {
            tickAnimation();
        }
    }

    applyAnimation(target, lastKeyframe, nextKeyframe, progress) {
        target.position.x = this.linearLerp(lastKeyframe.value[0], nextKeyframe.value[0], progress);
        target.position.y = this.linearLerp(lastKeyframe.value[1], nextKeyframe.value[1], progress);
        target.position.z =this.linearLerp(lastKeyframe.value[2], nextKeyframe.value[2], progress);
    }

    linearLerp(value1, value2, progress) {
        return value1 + progress * (value2 - value1);
    }

    setKeyframe(state) {
        this.keyframes.push(state);
    }
}

export class Keyframe {

    constructor(value) {
        this.value = value;
    }

}
