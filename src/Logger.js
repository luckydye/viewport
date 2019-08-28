const loggerListeners = new Map();

export class Logger {

    static listen(name, f) {
        const listeners = loggerListeners.get(name);
        if (listeners) {
            listeners.push(f);
        }
    }

    static dispatch(name, msg) {
        const listeners = loggerListeners.get(name);
        if (listeners) {
            for (let listener of listeners) {
                listener(msg);
            }
        }
    }

    constructor(name) {
        this.prefix = name;

        loggerListeners.set(name, []);
    }

    style(type) {
        return {
            prefix: `
                background: ${type == 'error' ? 'red' : '#1c1c1c'};
                color: rgba(255, 255, 255, 0.65);
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 4px;
                margin-right: 5px;
            `,
            text: `
                color: #eee;
                padding: 2px 4px;
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
        if (attr) {
            console[type](
                `%c${this.prefix}%c${text}%c${attr}`,
                this.style(type).prefix,
                this.style(type).text,
                this.style(type).attr
            );
        } else {
            console[type](
                `%c${this.prefix}%c${text}`,
                this.style(type).prefix,
                this.style(type).text,
            );
        }

        Logger.dispatch(this.prefix, {
            style: this.style(type),
            prefix: this.prefix,
            text: text,
        });
    }

    log(text, attr) {
        this.out('info', text, attr);
    }

    error(text, attr) {
        this.out('error', text, attr);
    }

}
