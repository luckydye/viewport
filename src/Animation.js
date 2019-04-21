export class Animation {

    constructor(args = {
        fps: 60,
        duration: 3000,
        loop: true,
    }) {
        this.keyframes = [];

        this.duration = args.duration;
        this.framerate = args.fps;
        this.loop = args.loop;

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

    play(target, property, duration) {
        this.playing = true;
        this.duration = duration || this.duration;

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
                this.applyAnimation(target, property, lastKeyframe, nextKeyframe, progress);
            }
        }

        if(keyframes > 1) {
            tickAnimation();
        }
    }

    applyAnimation(target, property, lastKeyframe, nextKeyframe, progress) {
        for(let i in target.position) {
            target[property][i] = this.linearLerp(lastKeyframe.value[i], nextKeyframe.value[i], progress);
        }
    }

    linearLerp(value1, value2, progress) {
        return value1 + progress * (value2 - value1);
    }

    bezierLerp(vale1, value2, value3, value4, progress) {
        const a = linear(p0, p1, t);
        const b = Lerp(p1, p2, t);
        const c = Lerp(p2, p3, t);
        const d = Lerp(a, b, t);
        const e = Lerp(b, c, t);
        const pointOnCurve = Lerp(d, e, t);
    }

    setKeyframe(state) {
        this.keyframes.push(state);
    }
}

export class Keyframe {

    get value() {
        let values = [ this.input ];
        if(Array.isArray(this.input)) {
            values = this.input;
        }
        return values;
    }

    constructor(value) {
        this.input = value;
    }

}
