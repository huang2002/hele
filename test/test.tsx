/// <reference types="../index" />

const { render, Component, Fragment, Portal, Context, Reference } = HEle;

const commonHooks = [
    'onWillMount', 'onDidMount',
    'onWillUnmount', 'onDidUnmount',
    'onCaughtError'
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
interface GreetingState {
    target: string;
}
class Greeting extends Component<GreetingProps, GreetingState> {
    constructor(props: GreetingProps, context: any) {
        super(props, context);
        this.clickHandler = this.clickHandler.bind(this);
        this.state = {
            target: props.defaultTarget!
        };
    }
    static defaultProps = {
        defaultTarget: 'HEle'
    };
    render() {
        return (
            <Fragment>
                <h1>
                    Hi, <GreetingTarget>{this.state.target}</GreetingTarget>!
                </h1>
                <button onclick={this.clickHandler} class={['button', 0, null, true]}>Change target</button>
            </Fragment>
        );
    }
    clickHandler() {
        const target = prompt('New target:', this.state.target);
        if (target !== null) {
            this.update({ target });
        }
    }
}
logHooks(Greeting);

interface ClockProps {
    color?: string;
    colorId?: string;
}
interface ClockState {
    date: Date;
}
class Clock extends Component<ClockProps, ClockState> {
    constructor(props: ClockProps, context: any) {
        super(props, context);
        this.state = {
            date: new Date()
        };
        this.color = props.colorId ? context['color' + props.colorId] : this.props.color!;
    }
    static defaultProps = { color: 'lightgreen' };
    timer: number = -1;
    color: string;
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
        return (
            <p style={{ color: this.color }} class="clock">
                {this.state.date.toLocaleString()}
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

class Counter extends Component<{}, number> {
    constructor(props: {}, context: any) {
        super(props, context);
        this.state = 0;
    }
    increaser = () => {
        this.requestUpdate(state => state + 1);
    };
    render() {
        return (
            <Fragment>
                Count: {this.state}
                <br />
                <button onclick={this.increaser}>Count++</button>
            </Fragment>
        );
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

class Catcher extends Component<{}, Error | null> {
    constructor(props: {}, context: any) {
        super(props, context);
        this.state = null;
    }
    render() {
        return this.state ? 'Succeeded to catch the error!' : this.props.children;
    }
    onCaughtError(error: Error) {
        this.update(error);
    }
}
logHooks(Catcher);

const appRef = new Reference(),
    lazyboneRef = new Reference<Lazybone>();
render(
    (
        <Context value={{ color0: 'lightblue' }}>
            <Context value={{ color1: 'purple' }}>
                <div>
                    <Clock color="green" />
                    <App ref={appRef} />
                    <Portal container={document.getElementById('portal')!}>
                        <Clock colorId="0" />
                    </Portal>
                    <Counter />
                    <Portal>
                        <Clock colorId="1" />
                    </Portal>
                </div>
            </Context>
            <br />
            <Lazybone ref={lazyboneRef} />
            <br />
            <button onclick={() => { lazyboneRef.current!.forceUpdate() }}>tick</button>
            <br />
            <br />
            <Catcher>
                <ErrorComponent />
            </Catcher>
            <br />
            <Catcher>
                <div>
                    <ErrorComponent />
                </div>
            </Catcher>
            <br />
        </Context>
    ),
    document.getElementById('root')!
);
