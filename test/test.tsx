/// <reference types="../" />

const { render, Component, Fragment, Portal, Reference } = HEle;

const commonHooks = [
    'onWillMount', 'onDidMount',
    'onWillUnmount', 'onDidUnmount'
], optionalHooks = [
    'onWillUpdate', 'onDidUpdate'
];
function logHooks(constructor: HEle.ComponentConstructor<any>, optional = true) {
    const components = new Array<HEle.Component>();
    [...commonHooks, ...(optional ? optionalHooks : [])].forEach(hook => {
        const { prototype } = constructor,
            original = prototype[hook];
        prototype[hook] = function (...args: any[]) {
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

interface GreetingTargetProps {
    children: any;
}
const GreetingTarget: HEle.ComponentFactory<GreetingTargetProps> = props => {
    return <span style="color: blue;">{props.children}</span>;
};

interface GreetingProps {
    defaultTarget?: string;
}
interface GreetingStates {
    target: string;
}
class Greeting extends Component<GreetingProps, GreetingStates> {
    constructor(props: GreetingProps) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
        this.states = {
            target: props.defaultTarget as string
        };
    }
    static defaultProps = {
        defaultTarget: 'HEle'
    };
    render() {
        return (
            <Fragment>
                <h1>
                    Hi, <GreetingTarget>{this.states.target}</GreetingTarget>!
                </h1>
                <button onclick={this.clickHandler}>Change target</button>
            </Fragment>
        );
    }
    clickHandler() {
        const target = prompt('New target:', this.states.target);
        if (target !== null) {
            this.update({ target });
        }
    }
}
logHooks(Greeting);

interface ClockProps {
    color?: string;
}
interface ClockStates {
    date: Date;
}
class Clock extends Component<ClockProps, ClockStates> {
    constructor(props: ClockProps) {
        super(props);
        this.states = {
            date: new Date()
        };
    }
    static defaultProps = { color: 'lightgreen' };
    timer: number = -1;
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
        return (
            <p style={{ color: this.props.color as string, fontWeight: 'bold' }}>
                {this.states.date.toLocaleString()}
            </p>
        );
    }
    onWillUnmount() {
        clearInterval(this.timer);
    }
}
logHooks(Clock, false);

class App extends Component<HEle.RawProps> {
    render() {
        return (
            <Fragment>
                <Greeting />
                <Clock />
            </Fragment>
        );
    }
}
logHooks(App);

const appRef = new Reference();
render(
    (
        <Fragment>
            <Clock color="green" />
            <App ref={appRef} />
            <Portal container={document.getElementById('portal') as HTMLElement}>
                <Clock color="lightblue" />
            </Portal>
            <Portal>
                <Clock color="purple" />
            </Portal>
        </Fragment>
    ),
    document.getElementById('root') as HTMLElement
);
