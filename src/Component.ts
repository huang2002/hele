import { Props, RawProps } from "./props";
import { Reference } from "./Reference";
import { isEqual } from "./utils";
import { Ticker } from "./Ticker";

export interface ComponentConstructor<P extends RawProps = RawProps, S = any, SS = any> {
    new(props: P): Component<P, S, SS>;
    defaultProps: RawProps;
}
export type ComponentFactory<P extends RawProps = RawProps> = (props: P) => any;
export type ComponentGetter<P extends RawProps = RawProps, S = any, SS = any> = ComponentConstructor<P, S, SS> | ComponentFactory<P>;

export type UpdateRequestCallback<S> = (oldStates: S) => Partial<S>;

export abstract class Component<P extends RawProps = RawProps, S = any, SS = any> {

    constructor(
        props: P
    ) {
        this.props = props as P & Props;
    }

    static defaultProps: RawProps = {};

    props: Readonly<P & Props>;
    states: S = {} as S;
    refs = new Map<string, Reference>();
    updateRequestCallbacks = new Array<UpdateRequestCallback<S>>();

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
        console.error('UncaughtError:', error);
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

    requestUpdate(callback: UpdateRequestCallback<S>) {
        this.updateRequestCallbacks.push(callback);
        Ticker.updateComponent(this);
        return this;
    }
    update(newStates: Partial<S>) {
        return this.requestUpdate(() => newStates);
    }

}
