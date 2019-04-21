import { Task } from "./Scheduler";

export class Animation extends Task {

    constructor(target, property, duration = 1000, loop = false) {
        super();

        this.keyframes = [];

        this.playing = false;
        this.duration = duration;
        this.loop = loop;

        this.target = {
            object: target,
            property: property
        };

        this.reset();
    }

    execute(ms) {
        this.animate(ms);
        return !this.playing;
    }

    reset() {
        this.time = 0;
    }

    stop() {
        this.playing = false;
    }

    animate(deltaTime) {
        const keyframes = this.keyframes.length;
        
        this.playing = true;
        this.time += deltaTime;

        if(this.time >= this.duration) {
            this.reset();

            if(!this.loop) this.stop();

        } else {
            const frameTime = Math.floor(this.duration / (keyframes-1));
            const currentKeyframe = this.time / frameTime;
            const lastKeyframe = this.keyframes[Math.floor(currentKeyframe)];
            const nextKeyframe = this.keyframes[Math.floor(currentKeyframe)+1];
            const progress = currentKeyframe - Math.floor(currentKeyframe);
    
            this.applyAnimation(lastKeyframe, nextKeyframe, progress);
        }
    }

    applyAnimation(lastKeyframe, nextKeyframe, progress) {
        const object = this.target.object;
        const property = this.target.property;
        
        for(let i in object[property]) {
            object[property][i] = this.linearLerp(lastKeyframe.value[i], nextKeyframe.value[i], progress);
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
