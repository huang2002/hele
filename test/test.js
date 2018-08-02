"use strict";
/// <reference types="../" />
const { render, Component, Fragment, Portal, Reference } = HEle;
const commonHooks = [
    'onWillMount', 'onDidMount',
    'onWillUnmount', 'onDidUnmount'
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
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
        this.states = {
            target: props.defaultTarget
        };
    }
    render() {
        return (HEle.createElement(Fragment, null,
            HEle.createElement("h1", null,
                "Hi, ",
                HEle.createElement(GreetingTarget, null, this.states.target),
                "!"),
            HEle.createElement("button", { onclick: this.clickHandler }, "Change target")));
    }
    clickHandler() {
        const target = prompt('New target:', this.states.target);
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
    constructor(props) {
        super(props);
        this.timer = -1;
        this.states = {
            date: new Date()
        };
    }
    updateTime() {
        this.update({ date: new Date() });
    }
    onWillMount() {
        this.updateTime();
        this.timer = setInterval(() => {
            this.updateTime();
        }, 1000);
    }
    render() {
        return (HEle.createElement("p", { style: { color: this.props.color, fontWeight: 'bold' } }, this.states.date.toLocaleString()));
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
const appRef = new Reference();
render((HEle.createElement(Fragment, null,
    HEle.createElement(Clock, { color: "green" }),
    HEle.createElement(App, { ref: appRef }),
    HEle.createElement(Portal, { container: document.getElementById('portal') },
        HEle.createElement(Clock, { color: "lightblue" })),
    HEle.createElement(Portal, null,
        HEle.createElement(Clock, { color: "purple" })))), document.getElementById('root'));
