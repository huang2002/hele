const h = HEle.createElement,
    { Component, Fragment, Reference, Portal } = HEle;

const appRef = new Reference();
let timeRef;

const log = (message, ...args) => { console.log(`%c [ ${message} ]`, 'color: #0f0;', ...args); };

const hookLoggers = {
    onWillMount() { log('WillMount', this); },
    onDidMount() { log('DidMount', this); },
    onWillUpdate() { log('WillUpdate', this); },
    onDidUpdate() { log('DidUpdate', this); },
    onWillUnmount() { log('WillUnmount', this); },
    onDidUnmount() { log('DidUnmount', this); }
};
function logHooks(componentConstructor) {
    const { prototype } = componentConstructor;
    for (const hook in hookLoggers) {
        const original = prototype[hook];
        prototype[hook] = function () {
            original.call(this);
            hookLoggers[hook].call(this);
        };
    }
}

function GreetingTarget(props) {
    console.log('GreetingTarget created.');
    return h(
        'span',
        { style: 'color: blue;' },
        props.children
    );
}

class GreetingButton extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    render() {
        return h(
            Fragment,
            null,
            h(
                'button',
                {
                    style: {
                        fontWeight: 'bold',
                        padding: '.5em .6em'
                    },
                    onclick: this.onClick
                },
                'Change target'
            )
        );
    }
    onClick() {
        const { greeting } = this.props;
        const target = prompt('New target:', greeting.states.target);
        if (target) {
            greeting.update({ target });
        }
    }
}
logHooks(GreetingButton);

class Greeting extends Component {
    constructor(props) {
        super(props);
        this.states = {
            target: props.target
        };
    }
    render() {
        return h(
            Fragment,
            null,
            h(
                'h2',
                null,
                'Hi, ',
                h(
                    GreetingTarget,
                    {
                        ref: this.createRef('greetingTarget')
                    },
                    this.states.target
                ),
                '.'
            ),
            h(
                GreetingButton,
                {
                    greeting: this
                }
            )
        );
    }
}
logHooks(Greeting);

class App extends Component {
    render() {
        return h(
            'div',
            {
                id: 'app'
            },
            h(
                'h1',
                {
                    title: this.props.title,
                    onmouseenterCapture(e) { log('Mouseenter', e); },
                    onmouseoutOnce(e) { log('Mouseout', e); }
                },
                'Hello, world!'
            ),
            h(
                Greeting,
                {
                    target: this.props.target,
                    ref: this.createRef('greeting')
                }
            )
        );
    }
}
App.defaultProps = {
    target: 'HEle'
};
logHooks(App);

class Clock extends Component {
    constructor(props) {
        super(props);
        this.states = {
            date: new Date(),
            show: true
        };
    }
    render() {
        return h(
            Portal,
            { container: document.getElementById('portal') },
            this.states.show && h(
                'p',
                {
                    id: 'clock',
                    title: 'Current time.',
                    ref: this.createRef('time')
                },
                this.states.date.toString()
            )
        );
    }
    onWillMount() {
        timeRef = this.createRef('time');
        this.timer = setInterval(() => {
            this.updateDate();
        }, 1000);
    }
    onDidUnmount() {
        clearInterval(this.timer);
    }
    updateDate() {
        this.update({ date: new Date() });
    }
    show() {
        this.update({ show: true });
    }
    hide() {
        this.update({ show: false });
    }
}

HEle.render(
    h(
        Fragment,
        null,
        h(
            App,
            {
                title: 'hi',
                ref: appRef
            }
        ),
        h(
            Clock
        )
    ),
    document.getElementById('root')
);
