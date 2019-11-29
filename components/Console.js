import { render, html } from 'lit-html';
import Config from '../src/Config.js';

// An ui interface for the Config class (global config)

const GLOBAL_COMMANDS = {

    list(console, args) {
        const keys = Object.keys(Config.global);

        console.log('Command list:');

        for(let key in GLOBAL_COMMANDS) {
            console.log(key);
        }

        for(let key of keys) {
            const param = Config.global[key];
            console.log(`${key.padEnd(15, " ")} ${(param.value || "undefined").toString().padEnd(15, " ")} default: ${param.default}`);
        }
    },

    clear(console) {
        console.clear();
    },

    exit(console) {
        console.hide();
    }

}

export class Console extends HTMLElement {

    get input() {
        return this.shadowRoot.querySelector('input');
    }

    constructor(progress) {
        super();

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

    eval(string) {
        this.history.unshift(string);

        const args = string.split(" ");
        const config = Config.global;

        const commands = GLOBAL_COMMANDS;

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
        this.input.focus();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        let index = -1;

        const template = html`
            <style>
                :host {
                    background: rgba(27, 27, 27, 0.75);
                    display: flex;
                    flex-direction: column;
                    color: #eee;
                    overflow: hidden;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                    user-select: text;
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
                    background: rgba(0, 0, 0, 0.33);
                    border: none;
                    outline: none;
                    font-size: 13px;
                    font-family: monospace;
                    width: 100%;
                    box-sizing: border-box;
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
            </style>
            <div class="log">
                ${this.logs.map(log => {
                    return html`<span class="log-line">${log}</span>`;
                })}
            </div>
            <input type="text" @blur=${() => {
                this.hide();
            }} @keydown=${e => {
                if(e.key == "Escape") {
                    this.hide();
                }
                if(e.key == "ArrowUp") {
                    index = Math.min(index + 1, this.history.length - 1);
                    this.input.value = this.history[index] || "";
                    setTimeout(() => this.input.setSelectionRange(this.input.value.length, this.input.value.length), 0);
                }
                if(e.key == "ArrowDown") {
                    index = Math.max(index - 1, 0);
                    this.input.value = this.history[index] || "";
                    setTimeout(() => this.input.setSelectionRange(this.input.value.length, this.input.value.length), 0);
                }
                if(e.key == "Enter" && this.input.value != "") {
                    this.eval(this.input.value);
                    this.input.value = "";
                    const log = this.shadowRoot.querySelector('.log');
                    log.scrollTo(0, log.scrollHeight);
                }
            }}/>
        `;
        render(template, this.shadowRoot);
    }

}

customElements.define('dev-console', Console);
