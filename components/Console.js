import { render, html } from 'lit-html';
import Config from '../src/Config.js';

// An ui interface for the Config class (global config)

const Commands = {

    help(console, args) {
        const keys = Object.keys(Config.global);

        console.log('Command list:');

        for(let key in Commands) {
            console.log(key);
        }

        for(let key of keys) {
            if(Commands[key] != null) {
                const param = Config.global[key];
                console.log(`${key.padEnd(15, " ")} ${(param.value || "undefined").toString().padEnd(15, " ")} default: ${param.default}`);
            }
        }
    },

    list(console, args) {
        console.log('Variable list:');

        for(let key in Config.global) {
            console.log(key);
        }
    },

    find(console, args) {
        const keys = Object.keys(Config.global);
        const cmds = Object.keys(Commands);

        console.log('Matches:');

        if(args[0]) {
            for(let key of [...keys, ...cmds]) {
                if(key.match(args[0])) {
                    const param = Config.global[key];
                    if(param) {
                        console.log(`${key.padEnd(15, " ")} ${(param.value || "undefined").toString().padEnd(15, " ")} default: ${param.default}`);
                    } else {
                        console.log(key.padEnd(15, " "));
                    }
                }
            }
        }
    },

    reset(console) {
        const keys = Object.keys(Config.global);
        for(let key of keys) {
            const param = Config.global[key];
            Config.global.setValue(param.name, param.default);
        }
        Config.global.save();

        console.log('Config reset.');
    },

    reload() {
        location.reload();
    },

    clear(console) {
        console.clear();
    },

    exit(console) {
        console.hide();
    }

}

export class Console extends HTMLElement {

    static get Commands() {
        return Commands;
    }

    get input() {
        return this.shadowRoot.querySelector('input');
    }

    constructor(progress) {
        super();

        this.suggestions = [];
        this.logs = ["Config loaded."];
        this.history = [];

        this.attachShadow({ mode: 'open' });

        window.addEventListener('keyup', e => {
            if(e.key === "#") {
                this.show();
            }
        });
    }

    clear(...stringArray) {
        this.logs = ["Console cleard."];
        this.render();
    }

    log(...stringArray) {
        this.logs.push(stringArray.join(" "));
        this.render();
    }

    error(...stringArray) {
        this.logs.push(html`<span style="color: #e96363;">${stringArray.join(" ")}</span>`);
        this.render();
    }

    eval(string) {
        this.history.unshift(string);

        const args = string.split(" ");
        const config = Config.global;

        const commands = Console.Commands;

        if(args[0] in commands) {
            commands[args[0]](this, args.slice(1));
        } else if(!config.hasValue(args[0])) {
            // unkown keyword
            this.log(`"${args[0]}" Unknown command.`);
        } else {
            // set config value
            if(args[1]) {
                config.setValue(args[0], eval(args[1]));
                this.log(`${args[0]} set to ${args[1]}`);
                Config.global.save();
            } else {
                const value = config.getValue(args[0]);
                this.log(`${args[0]}: ${value}`);
            }
        }
    }

    hide() {
        this.removeAttribute('open');
    }

    show() {
        this.setAttribute('open', "");
        this.focus();
        this.input.focus();

        this.onblur = () => this.hide();
    }

    connectedCallback() {
        this.tabIndex = 0;
        this.render();
    }

    suggest() {
        const options = [];
        const str = this.input.value;

        if(str.length > 1) {

            for(let key in Config.global) {
                if(key.toLocaleLowerCase().match(str.toLocaleLowerCase())) {
                    options.push(key);
                }
             }

            for(let key in Commands) {
                if(key.toLocaleLowerCase().match(str.toLocaleLowerCase())) {
                    options.push(key);
                }
            }
        }

        this.suggestions = options;
    }

    submit() {
        try {
            this.eval(this.input.value);
            this.input.value = "";
            this.suggestions = [];
            const log = this.shadowRoot.querySelector('.log');
            log.scrollTo(0, log.scrollHeight);

            this.render();
        } catch(err) {
            this.error(err);
        }
    }

    replaceCurrentWord(str) {
        const words = this.input.value.split(" ");

        // handle selection
        words[words.length-1] = str;

        this.input.value = words.join(" ");

        this.suggest();
        this.render();
    }

    historyUp(index) {
        index = Math.min(index + 1, this.history.length - 1);
        this.input.value = this.history[index] || "";
        setTimeout(() => this.input.setSelectionRange(this.input.value.length, this.input.value.length), 0);
    }

    historyDown(index) {
        index = Math.max(index - 1, 0);
        this.input.value = this.history[index] || "";
        setTimeout(() => this.input.setSelectionRange(this.input.value.length, this.input.value.length), 0);
    }

    render() {
        let index = -1;

        const template = html`
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    color: #333;
                    z-index: 1000;
                    user-select: text;
                    outline: none;
                    position: relative;
                }
                :host(:not([open])) {
                    display: none;
                }
                .log {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: auto;
                    font-size: 13px;
                    font-family: monospace;
                    font-weight: 200;
                    flex: 1;
                    padding: 8px;
                    box-sizing: border-box;
                }
                .log-line {
                    white-space: pre;
                }
                input {
                    padding: 8px;
                    color: currentColor;
                    border: none;
                    outline: none;
                    font-size: 13px;
                    font-family: monospace;
                    width: 100%;
                    box-sizing: border-box;
                    background: rgba(0, 0, 0, 0.1);
                    border-top: 1px solid var(--gyro-background);
                }
                ::-webkit-scrollbar {
                    width: 12px;
                    margin: 0 4px;
                    margin-left: 2px;
                }
                ::-webkit-scrollbar-button {
                    display: none;
                }
                ::-webkit-scrollbar-track-piece  {
                    background: var(--gyro-level2-bg);
                }
                ::-webkit-scrollbar-thumb {
                    background: var(--gyro-level4-bg);
                    border-radius: 5px;
                    border: 2px solid var(--gyro-level2-bg);
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: var(--gyro-highlight);
                }
                .suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    font-family: sans-serif;
                    font-size: 12px;
                }
                .suggestion {
                    background: #23232382;
                    padding: 4px 10px;
                    cursor: pointer;
                }
                .suggestion:hover {
                    background: #232323FF;
                }
            </style>
            <div class="log">
                ${this.logs.map(log => {
                    return html`<span class="log-line">${log}</span>`;
                })}
            </div>
            <input type="text" @keydown=${e => {
                if(e.key == "Escape") {
                    this.hide();
                } else if(e.key == "ArrowUp") {
                    this.historyUp(index);
                } else if(e.key == "ArrowDown") {
                    this.historyDown(index);
                } else if(e.key == "Enter" && this.input.value != "") {
                    this.submit();
                } else if(e.key == "Tab") {
                    this.replaceCurrentWord(this.suggestions[0]);
                    e.preventDefault();
                }
            }} @keyup=${e => {
                if(e.key !== "Escape" && e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Enter") {
                    this.suggest();
                    this.render(); 
                }
            }}/>
            <div class="suggestions" data="${this.suggestions.length}">
                ${this.suggestions.map(str => html`
                    <div class="suggestion" @click=${() => {this.replaceCurrentWord(str)}}>${str}</div>
                `)}
            </div>
        `;
        render(template, this.shadowRoot);
    }

}

customElements.define('dev-console', Console);
