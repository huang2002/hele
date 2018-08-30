"use strict";
/// <reference types="../index" />
const { render, Component, Fragment, Portal, Context, Reference } = HEle;
const commonHooks = [
    'onWillMount', 'onDidMount',
    'onWillUnmount', 'onDidUnmount',
    'onCaughtError'
], optionalHooks = [
    'onWillUpdate', 'onDidUpdate'
];
function logHooks(constructor, optional = true) {
    const components = new Array();
    [...commonHooks, ...(optional ? optionalHooks : [])].forEach(hook => {
        const { prototype } = constructor, original = prototype[hook];
        prototype[hook] = function (...args) {
            let id = components.indexOf(this);
            if (id === -1) {
                id = components.length;
                components.push(this);
            }
            console.log(`[ ${hook} ] ${constructor.name} ${id}`);
            return original.call(this, ...args);
        };
    });
}
const GreetingTarget = props => {
    return HEle.createElement("span", { style: "color: blue;" }, props.children);
};
class Greeting extends Component {
    constructor(props, context) {
        super(props, context);
        this.clickHandler = this.clickHandler.bind(this);
        this.state = {
            target: props.defaultTarget
        };
    }
    render() {
        return (HEle.createElement(Fragment, null,
            HEle.createElement("h1", null,
                "Hi, ",
                HEle.createElement(GreetingTarget, null, this.state.target),
                "!"),
            HEle.createElement("button", { onclick: this.clickHandler, class: ['button', 0, null, true] }, "Change target")));
    }
    clickHandler() {
        const target = prompt('New target:', this.state.target);
        if (target !== null) {
            this.update({ target });
        }
    }
}
Greeting.defaultProps = {
    defaultTarget: 'HEle'
};
logHooks(Greeting);
class Clock extends Component {
    constructor(props, context) {
        super(props, context);
        this.timer = -1;
        this.state = {
            date: new Date()
        };
        this.color = props.colorId ? context['color' + props.colorId] : this.props.color;
    }
    updateTime() {
        this.update({ date: new Date() });
    }
    onWillMount() {
        this.updateTime();
        this.timer = setInterval(() => {
            this.updateTime();
        }, 500);
    }
    render() {
        return (HEle.createElement("p", { style: { color: this.color }, class: "clock" }, this.state.date.toLocaleString()));
    }
    onWillUnmount() {
        clearInterval(this.timer);
    }
}
Clock.defaultProps = { color: 'lightgreen' };
logHooks(Clock, false);
class App extends Component {
    render() {
        return (HEle.createElement(Fragment, null,
            HEle.createElement(Greeting, null),
            HEle.createElement(Clock, null)));
    }
}
logHooks(App);
class Counter extends Component {
    constructor(props, context) {
        super(props, context);
        this.increaser = () => {
            this.requestUpdate(state => state + 1);
        };
        this.state = 0;
    }
    render() {
        return (HEle.createElement(Fragment, null,
            "Count: ",
            this.state,
            HEle.createElement("br", null),
            HEle.createElement("button", { onclick: this.increaser }, "Count++")));
    }
}
logHooks(Counter);
class Lazybone extends Component {
    render() {
        return Date();
    }
}
logHooks(Lazybone);
const ErrorComponent = () => { throw "Error."; };
class Catcher extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = null;
    }
    render() {
        return this.state ? 'Succeeded to catch the error!' : this.props.children;
    }
    onCaughtError(error) {
        this.update(error);
    }
}
logHooks(Catcher);
const appRef = new Reference(), lazyboneRef = new Reference();
render((HEle.createElement(Context, { value: { color0: 'lightblue' } },
    HEle.createElement(Context, { value: { color1: 'purple' } },
        HEle.createElement("div", null,
            HEle.createElement(Clock, { color: "green" }),
            HEle.createElement(App, { ref: appRef }),
            HEle.createElement(Portal, { container: document.getElementById('portal') },
                HEle.createElement(Clock, { colorId: "0" })),
            HEle.createElement(Counter, null),
            HEle.createElement(Portal, null,
                HEle.createElement(Clock, { colorId: "1" })))),
    HEle.createElement("br", null),
    HEle.createElement(Lazybone, { ref: lazyboneRef }),
    HEle.createElement("br", null),
    HEle.createElement("button", { onclick: () => { lazyboneRef.current.forceUpdate(); } }, "tick"),
    HEle.createElement("br", null),
    HEle.createElement("br", null),
    HEle.createElement(Catcher, null,
        HEle.createElement(ErrorComponent, null)))), document.getElementById('root'));
