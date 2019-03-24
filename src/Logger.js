export class Logger {

    constructor(name) {
        this.prefix = name;

        this.style = {
            prefix: `
                background: #1c1c1c;
                color: rgba(255, 255, 255, 0.65);
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 4px;
                margin-right: 5px;
            `,
            text: `
                background: #333;
                color: #eee;
                padding: 2px 6px;
            `,
            attr: `
                background: #3f3f3f;
                color: #eee;
                padding: 2px 6px;
                font-style: italic;
            `
        };
    }

    out(type, text, attr) {
        if(attr) {
            console[type](
                `%c${this.prefix}%c${text}%c${attr}`,
                this.style.prefix, 
                this.style.text,
                this.style.attr
            );
        } else {
            console[type](
                `%c${this.prefix}%c${text}`,
                this.style.prefix, 
                this.style.text,
            );
        }

        if(thconsole) {
            thconsole.log(
                `<span style="${this.style.prefix}">${this.prefix}</span>`, 
                `<span style="${this.style.text}">${text}</span>`,
            );
        }
    }

    log(text, attr) {
        this.out('info', text, attr);
    }

    error(text, attr) {
        this.out('error', text, attr);
    }

}
