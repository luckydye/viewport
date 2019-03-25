export class ConsoleEngiene {

    evaluate(js) {
        let test = 200;
        return eval(js);
    }

    formatValue(value) {
        if(!value) {
            value = `<span style="font-style: italic; color: #eee;">${value}</span>`;
        } else {
            switch(typeof value) {
                case "string":
                    if(value.length < 400) {
                        const ele = document.createElement('span');
                        ele.innerText = value;
                        value = ele.outerHTML;   
                    } else {
                        value = '"..."';
                    }
                    break;
                case "number":
                    value = `${value}`;
                    break;
                case "boolean":
                    value = `<span style="font-style: italic; color: #eee;">${value}</span>`;
                    break;
                default:
                    value = value.constructor.name;
                    break;
            }
        }
        return value;
    }

    formatOutput(evaluation) {
        let output = "";

        if(!evaluation) {
            // format undefined null and false
            output = this.formatValue(evaluation);

        } else if(Array.isArray(evaluation)) {
            // format arrays
            output += "[";
            
            const maxCount = 15;
            let count = 0;

            let attr = [];
            for(let key in evaluation) {
                let value = this.formatValue(evaluation[key]);
                attr.push(value);

                count++;
                if(count >= maxCount) {
                    attr.push("...");
                    break;
                }
            }
            output += attr.join(', ') + "]";

        } else if(typeof evaluation == "object") {
            // format general objects
            output += evaluation.constructor.name + " { ";
            
            const maxCount = 15;
            let count = 0;

            let attr = [];
            for(let key in evaluation) {
                let value = this.formatValue(evaluation[key]);
                attr.push(`<span style="font-style: italic; color: #eee;">${key}</span>: ${value}`);

                count++;
                if(count >= maxCount) {
                    attr.push("...");
                    break;
                }
            }
            output += attr.join(', ') + " }";

        } else {
            // format single values
            output = this.formatValue(evaluation);
        }

        return output;
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

                .input-tips {
                    background: #333;
                    color: white;
                    position: absolute;
                    bottom: 32px;
                    left: 12px;
                    font-family: sans-serif;
                    font-size: 13px;
                }
            </style>
            <div class="console-lines"></div>
            <div class="input-tips"></div>
        `;
    }

    constructor() {
        super();
        
        this.engiene = new ConsoleEngiene();
    }

    connectedCallback() {
        this.input = document.createElement('th-console-input');
        this.tips = this.root.querySelector('.input-tips');
        this.root.appendChild(this.input);

        this.input.addEventListener('submit', () => {
            this.tips.innerText = "";
            this.onNewLine(this.input.value);
        })

        let lastMatch = null;
        let lastPart = 0;

        this.input.addEventListener('input', () => {
            const reevaluate = () => {
                try {
                    const value = this.input.value;
                    const evaluation = this.engiene.evaluate(value.substring(0, value.length-1));
                    const mtaches = [];
                    for(let key in evaluation) {
                        mtaches.push(key);
                    }
                    lastMatch = mtaches;
                    this.tips.innerText = "";
                } catch(err) { }
            }

            let parts = this.input.value.split('.');
            let part = parts[parts.length-1];
            if(parts.length != lastPart) {
                lastPart = parts.length;
                reevaluate();
            }

            if(!lastMatch) {
                reevaluate();
            }

            for(let match of lastMatch) {
                if(match.match(part)) {
                    parts[parts.length-1] = match;
                    this.tips.innerText = parts.join('.');
                    break;
                } else {
                    this.tips.innerText = "";
                }
            }
        })
    }

    onNewLine(inputString) {
        this.createLine('input', inputString);

        try {
            const evaluation = this.engiene.evaluate(inputString);
            let output = this.engiene.formatOutput(evaluation);
            this.createLine('output', output);
        } catch(err) {
            this.error(err);
        }
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

        lines.scrollTo(0, delta);
    }

    log(...strArr) {
        this.createLine('output', strArr.join(''));
    }

    error(...strArr) {
        this.createLine('error', strArr.join(''));
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
        setTimeout(() => {
            this.input.selectionStart = this.input.selectionEnd = this.input.value.length;
        }, 0);
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

                .console-line.error::before,
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

                .console-line.error::before {
                    border-color: currentColor;
                }
                
                .console-line.error {
                    color: #ff4141;
                }

                .console-line.error::before,
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