export class ConsoleEngiene {

    evaluate(js) {
        let test = 200;
        return eval(js);
    }

}

class ConsoleElement extends HTMLElement {

    static template(attr) {
        return ``;
    }

    constructor() {
        super();

        const template = this.constructor.template(this);
        if(template) {
            this.attachShadow({ mode: 'open' });
            this.root = this.shadowRoot;
            this.root.innerHTML = template;
        }
    }

}

export class THConsole extends ConsoleElement {

    static template() {
        return `
            <style>
                :host {
                    width: 500px;
                    height: 150px;
                    display: flex;
                    flex-direction: column;
                }

                .console-lines {
                    height: 100%;
                    overflow: auto;
                    margin: 0 0 3px 0;
                }
            </style>
            <div class="console-lines"></div>
        `;
    }

    constructor() {
        super();
        
        this.engiene = new ConsoleEngiene();
    }

    connectedCallback() {
        this.input = document.createElement('th-console-input');
        this.root.appendChild(this.input);

        this.input.addEventListener('submit', () => {
            this.onNewLine(this.input.value);
        })
    }

    onNewLine(inputString) {
        this.createLine('input', inputString);

        const evaluation = this.engiene.evaluate(inputString);
        this.createLine('output', evaluation);
    }

    createLine(type, inputString) {
        const container = this.root.querySelector('.console-lines');
        const newLine = document.createElement('th-console-line');
        newLine.setContent(type, inputString);
        container.appendChild(newLine);
        this.scrollToBottom();
        return newLine;
    }

    scrollToBottom() {
        const lines = this.root.querySelector('.console-lines');
        const height = lines.clientHeight;
        const scrollheight = lines.scrollHeight;
        const delta = scrollheight - height;

        if(delta - lines.scrollTop < 32) {
            lines.scrollTo(0, delta);
        }
    }

    log(...strArr) {
        this.createLine('output', strArr.join(''));
    }
}

export class THConsoleInput extends ConsoleElement {

    static template() {
        return `
            <style>
                :host {
                    display: block;
                }

                .console-input {
                    opacity: 0.75;
                }

                input {
                    width: 100%;
                    border: none;
                    margin: 0;
                    padding: 8px 10px;
                    border-top-right-radius: 3px;
                    border-bottom-right-radius: 3px;
                    background: rgba(0, 0, 0, 0.333);
                    outline: none;
                    color: white;
                    box-sizing: border-box;
                    border-left: 2px solid rgba(255, 255, 255, 0.5);
                }
            </style>
            <div class="console-input">
                <input id="consoleInput" type="text" autocomplete="false" spellcheck="false"/>
            </div>
        `;
    }

    get value() {
        return this.input.value;
    }

    set value(str) {
        this.input.value = str;
    }

    connectedCallback() {
        this.input = this.root.getElementById('consoleInput');
        this.input.addEventListener('input', e => this.handleInput(e));
        this.input.addEventListener('keydown', e => this.handleInput(e));
        
        this.history = [];
        this.maxHistoryLength = 100;
        this.historyCursor = 0;

        let history = localStorage.getItem('th-console-history');
        if(history) this.history = history.split(',');
    }

    handleInput(e) {
        switch(e.which) {
            case 13:
                this.submit();
                break;
            case 27:
                this.clear();
                break;
                
            case 38: // arrow up
                this.prevInput();
                break;
            case 40:  // arrow down
                this.nextInput();
                break;
        }

        if(this.value == "") {
            this.clear();
        }
    }

    selectHistory(index) {
        this.historyCursor = index;
        const value = this.history[this.historyCursor];
        if(value) {
            this.value = value;
        }
    }
    
    prevInput() {
        this.selectHistory(this.historyCursor);
        if(this.historyCursor < this.history.length-1) {
            this.historyCursor++;
        }
    }
    
    nextInput() {
        this.selectHistory(this.historyCursor);
        if(this.historyCursor > 0) {
            this.historyCursor--;
        }
    }

    submit() {
        if(this.value != "") {
            this.dispatchEvent(new Event('submit'));

            if(this.history[0] != this.value) {
                this.history.unshift(this.value);
            }

            if(this.history.length > this.maxHistoryLength) {
                this.history.pop();
            }

            localStorage.setItem('th-console-history', this.history);

            this.clear();
        }
    }

    clear() {
        this.input.value = "";
        this.historyCursor = 0;
    }
}

export class THConsoleLine extends ConsoleElement {

    static template() {
        return `
            <style>
                :host {
                    color: white;
                    font-family: sans-serif;
                    padding: 5px 5px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    min-height: 15px;
                }

                :host(:not(:first-child)) {
                    border-top: 1px solid rgba(255, 255, 255, 0.025);
                }

                .console-line {
                    line-height: 100%;
                    position: relative;
                    padding-left: 10px;
                }

                .console-line.input::before,
                .console-line.output::before {
                    content: "";
                    opacity: 0.5;
                    font-size: 10px;
                    display: inline-block;
                    width: 5px;
                    height: 5px;
                    border-top: solid #eee;
                    border-left: solid #eee;
                    border-width: 2px;
                    position: absolute;
                    left: 0px;
                    top: 50%;
                }

                .console-line.output::before {
                    transform: translate(-50%, -50%) rotate(135deg);
                    margin-left: -3px;
                }

                .console-line.input::before {
                    transform: translate(-50%, -50%) rotate(-45deg);
                }
            </style>
            <div class="console-line"></div>
        `;
    }

    setContent(type, value) {
        this.inner.classList.add(type);
        this.inner.innerHTML = value;
    }

    constructor() {
        super();

        this.inner = this.root.querySelector('.console-line');
    }

}

customElements.define('th-console', THConsole);
customElements.define('th-console-line', THConsoleLine);
customElements.define('th-console-input', THConsoleInput);
