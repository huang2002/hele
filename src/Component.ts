import { Props, RawProps } from "./props";
import { Reference } from "./Reference";
import { isEqual } from "./utils";
import { Ticker } from "./Ticker";

export interface States {
    [key: string]: any;
}

export interface ComponentConstructor {
    new(props: Props): Component;
    defaultProps: RawProps;
}
export type ComponentFactory = (props: Props) => any;
export type ComponentGetter = ComponentConstructor | ComponentFactory;

export type UpdateRequestCallback = (oldStates: States) => States;

export abstract class Component<T = {}> {

    constructor(
        public readonly props: Props & T
    ) { }

    static defaultProps: RawProps = {};

    states: States = {};
    refs = new Map<string, Reference>();
    updateRequestCallbacks = new Array<UpdateRequestCallback>();

    abstract render(): any;
    toElement() {
        try {
            this.refs.clear();
            return this.render();
        } catch (error) {
            this.onUncaughtError(error);
            return null;
        }
    }

    onWillMount() { }
    onDidMount() { }
    shouldUpdate(oldStates: States & T, newStates: States & T) {
        return !isEqual(oldStates, newStates);
    }
    onWillUpdate(): any { }
    onDidUpdate(snapShot: any) { }
    onWillUnmount() { }
    onDidUnmount() { }
    onUncaughtError(error: Error) {
        console.error('UncaughtError(component,error): ', this, error);
    }

    createRef(name: string) {
        const ref = new Reference();
        this.refs.set(name, ref);
        return ref;
    }

    requestUpdate(callback: UpdateRequestCallback) {
        this.updateRequestCallbacks.push(callback);
        Ticker.updateComponent(this);
        return this;
    }
    update(newStates: States & T) {
        return this.requestUpdate(() => newStates);
    }

}
