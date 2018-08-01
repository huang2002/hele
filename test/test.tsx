/// <reference types="../" />

const { render, Component, Fragment } = HEle;

const hooks = [
    'onWillMount', 'onDidMount',
    'onWillUpdate', 'onDidUpdate',
    'onWillUnmount', 'onDidUnmount'
];
let count = 0;
function logHooks(constructor: HEle.ComponentConstructor<any>) {
    const id = count++;
    hooks.forEach(hook => {
        const { prototype } = constructor,
            original = prototype[hook];
        prototype[hook] = function (...args: any[]) {
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

interface GreetingProps extends HEle.AnyProps {
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
            <p style={{ color: this.props.color, fontWeight: 'bold' }}>
                {this.states.date.toLocaleString()}
            </p>
        );
    }
    onWillUnmount() {
        clearInterval(this.timer);
    }
}

class App extends Component<{}> {
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

render(
    (
        <Fragment>
            <Clock color="green" />
            <App />
        </Fragment>
    ),
    document.getElementById('root') as HTMLElement
);
