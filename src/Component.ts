import { Props, RawProps } from "./props";
import { Reference } from "./Reference";
import { isEqual } from "./utils";
import { Ticker } from "./Ticker";

export interface ComponentConstructor<T extends Props = Props> {
    new(props: Props & T): Component<T>;
    defaultProps: RawProps;
}
export type ComponentFactory<T extends Props = Props> = (props: Props & T) => any;
export type ComponentGetter<T extends Props = Props> = ComponentConstructor<T> | ComponentFactory<T>;

export type UpdateRequestCallback = (oldStates: any) => any;

export abstract class Component<T extends Props = Props> {

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
