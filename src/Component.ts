import { Props, RawProps } from "./props";
import { Reference } from "./Reference";
import { isEqual } from "./utils";
import { Ticker } from "./Ticker";

export interface ComponentConstructor {
    new(props: Props): Component;
    defaultProps: RawProps;
}
export type ComponentFactory = (props: Props) => any;
export type ComponentGetter = ComponentConstructor | ComponentFactory;

export type UpdateRequestCallback = (oldStates: any) => any;

export abstract class Component<T = {}> {

    constructor(
        public readonly props: Props & T
    ) { }

    static defaultProps: RawProps = {};

    states: any = {};
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
    shouldUpdate(oldStates: any, newStates: any) {
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
    update(newStates: any) {
        return this.requestUpdate(() => newStates);
    }

}
