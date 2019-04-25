export class Sounds {

    static capture() {
        return navigator.mediaDevices.getUserMedia({
            audio: true,
        }).then(function (stream) {
            return stream;
        });
    }

    static play(src) {
        const audio = new Audio();
        audio.srcObject = src;
        audio.volume = 1;
        // audio.play();
    }

    static analyze() {
        const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();


    }

    constructor() {

    }

}