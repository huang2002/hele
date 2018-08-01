"use strict";
/// <reference types="../" />
const { render, Component, Fragment } = HEle;
const hooks = [
    'onWillMount', 'onDidMount',
    'onWillUpdate', 'onDidUpdate',
    'onWillUnmount', 'onDidUnmount'
];
let count = 0;
function logHooks(constructor) {
    const id = count++;
    hooks.forEach(hook => {
        const { prototype } = constructor, original = prototype[hook];
        prototype[hook] = function (...args) {
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
class App extends Component {
    render() {
        return (HEle.createElement(Fragment, null,
            HEle.createElement(Greeting, null),
            HEle.createElement(Clock, null)));
    }
}
logHooks(App);
render((HEle.createElement(Fragment, null,
    HEle.createElement(Clock, { color: "green" }),
    HEle.createElement(App, null))), document.getElementById('root'));
