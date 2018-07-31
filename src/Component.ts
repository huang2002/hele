import { Props, RawProps } from "./props";
import { Reference } from "./Reference";
import { isEqual } from "./utils";
import { Ticker } from "./Ticker";

export interface ComponentConstructor<P extends Props = Props, S = any, SS = any> {
    new(props: P): Component<P, S, SS>;
    defaultProps: RawProps;
}
export type ComponentFactory<P extends Props = Props> = (props: P) => any;
export type ComponentGetter<P extends Props = Props, S = any, SS = any> = ComponentConstructor<P, S, SS> | ComponentFactory<P>;

export type UpdateRequestCallback = (oldStates: any) => any;

export abstract class Component<P extends Props = Props, S = any, SS = any> {

    constructor(
        public readonly props: P
    ) { }

    static defaultProps: RawProps = {};

    states: S = {} as S;
    refs = new Map<string, Reference>();
    updateRequestCallbacks = new Array<UpdateRequestCallback>();

    abstract render(): any;
    toElement() {
        try {
            this.refs.forEach(ref => {
                ref.current = undefined;
            });
            return this.render();
        } catch (error) {
            this.onUncaughtError(error);
            return null;
        }
    }

    onWillMount() { }
    onDidMount() { }
    shouldUpdate(oldStates: S, newStates: S) {
        return !isEqual(oldStates, newStates);
    }
    // @ts-ignore
    onWillUpdate(): SS { }
    onDidUpdate(snapShot: SS) { }
    onWillUnmount() { }
    onDidUnmount() { }
    onUncaughtError(error: Error) {
        console.error('UncaughtError(component,error): ', this, error);
    }

    createRef(name: string) {
        const { refs } = this;
        if (refs.has(name)) {
            return refs.get(name) as Reference;
        } else {
            const ref = new Reference();
            refs.set(name, ref);
            return ref;
        }
    }

    requestUpdate(callback: UpdateRequestCallback) {
        this.updateRequestCallbacks.push(callback);
        Ticker.updateComponent(this);
        return this;
    }
    update(newStates: S) {
        return this.requestUpdate(() => newStates);
    }

}
