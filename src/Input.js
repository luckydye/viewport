
const keyRegister = new Map();
const mouseListeners = [];

export default class Input {

    static init() {
        if(Input.initialized || !Input.domElement) {
            return;
        }

        Input.domElement.addEventListener('keydown', e => {
            const key = keyRegister.get(e.key);
    
            if(key && !key.pressed) {
                keyRegister.set(e.key, { pressed: true, touched: true });
            } else if(!key) {
                keyRegister.set(e.key, { pressed: true, touched: true });
            }
        });

        let dragging = false;
        let button = 0;

        window.addEventListener('mousemove', e => {
            if(dragging) {
                for(let f of mouseListeners) {
                    f({
                        button,
                        x: e.x,
                        y: e.y,
                    });
                }
            }
        });

        Input.domElement.addEventListener('mousedown', e => {
            button = e.button;
            for(let f of mouseListeners) {
                f({
                    first: true,
                    button,
                    x: e.x,
                    y: e.y,
                });
            }
            dragging = true;
        });
        
        window.addEventListener('mouseup', e => {
            dragging = false;
        });
        
        window.addEventListener('keyup', e => {
            keyRegister.set(e.key, { pressed: false, touched: false });
        });

        Input.initialized = true;
    }

    static onDrag(f) {
        mouseListeners.push(f);
    }

    static pressed(...btns) {
        const gamepad = navigator.getGamepads()[0];

        if(gamepad) for(let button of gamepad.buttons) {
            for(let btn of btns) {
                if(gamepad.buttons.indexOf(button) === btn) {
                    return button.pressed;
                }
            }
        }

        for(let btn of btns) {
            const key = keyRegister.get(btn);
            if(key) {
                return key.pressed;
            }
        }
    }

    static touched(...btns) {
        const gamepad = navigator.getGamepads()[0];
        
        if(gamepad) for(let button of gamepad.buttons) {
            for(let btn of btns) {
                if(gamepad.buttons.indexOf(button) === btn) {
                    return button.touched;
                }
            }
        }

        for(let btn of btns) {
            const key = keyRegister.get(btn);

            if(key && key.touched) {
                key.touched = false;
                return true;
            }
        }
    }

}

Input.domElement = window;
