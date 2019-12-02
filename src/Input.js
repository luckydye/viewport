
const keyRegister = new Map();

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
        
        window.addEventListener('keyup', e => {
            keyRegister.set(e.key, { pressed: false, touched: false });
        });

        Input.initialized = true;
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
