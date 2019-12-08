import { html, render } from 'lit-html';

export class Hud extends HTMLElement {

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    color: white;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    padding: 15px;
                    box-sizing: border-box;
                    font-family: sans-serif;
                }
            </style>
            <main></main>
        `;
        this.root = this.shadowRoot.querySelector('main');
    }

    connectedCallback() {
        this.render();
    }

    render() {
        render(this.renderTemplate(), this.root);
    }

    renderTemplate() {
        return html`
            <style>
                h2 {
                    margin: 0;
                    padding: 10px;
                    height: 100px;
                    width: 100px;
                    color: #333;
                    background: white;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            </style>
            <h2>Test2</h2>
        `;
    }

}

customElements.define('viewport-hud', Hud);
