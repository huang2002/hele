import { Props, RawProps } from "./props";
import { Reference } from "./Reference";
import { isEqual, _flatten } from "./utils";
import { Ticker } from "./Ticker";

export interface ComponentConstructor<P extends RawProps = RawProps, S = any, SS = any> {
    new(props: P, context: any): Component<P, S, SS>;
    defaultProps: RawProps;
}
export type ComponentFactory<P extends RawProps = RawProps> = (props: P, context: any) => any;
export type ComponentGetter<P extends RawProps = RawProps, S = any, SS = any> = ComponentConstructor<P, S, SS> | ComponentFactory<P>;

export type UpdateRequestCallback<S> = (oldState: S) => Partial<S>;

export abstract class Component<P extends RawProps = RawProps, S = any, SS = any> {

    constructor(
        props: P,
        public readonly context: any
    ) {
        this.props = props as P & Props;
    }

    static defaultProps: RawProps = {};

    props: Readonly<P & Props>;
    state: S = {} as S;
    refs = new Map<string, Reference>();
    updateRequestCallbacks = new Array<UpdateRequestCallback<S>>();

    abstract render(): any;
    toElement() {
        this.refs.forEach(ref => {
            ref.current = undefined;
        });
        try {
            return this.render();
        } catch (error) {
            this.onUncaughtError(error);
            return null;
        }
    }

    onWillMount() { }
    onDidMount() { }
    shouldUpdate(oldState: S, newState: S) {
        return !isEqual(oldState, newState);
    }
    // @ts-ignore
    onWillUpdate(newState: S): SS { }
    onDidUpdate(snapShot: SS) { }
    onWillUnmount() { }
    onDidUnmount() { }
    onUncaughtError(error: Error) {
        console.error('UncaughtError:', error);
    }

    createRef(name: string) {
        const { refs } = this;
        if (refs.has(name)) {
            return refs.get(name)!;
        } else {
            const ref = new Reference<any>();
            refs.set(name, ref);
            return ref;
        }
    }

    requestUpdate(callback: UpdateRequestCallback<S>) {
        this.updateRequestCallbacks.push(callback);
        Ticker._updateComponent(this);
        return this;
    }
    update(newState: Partial<S>) {
        return this.requestUpdate(() => newState);
    }

}

export const Fragment: ComponentFactory = (props) => {
    return _flatten<any>(props.children);
};

export interface ContextProps {
    value: any;
}

export class Context extends Component<ContextProps> {
    constructor(props: ContextProps, context: any) {
        super(props, context);
        this.value = { ...context, ...props.value };
    }
    value: any;
    render() {
        return _flatten<any>(this.props.children);
    }
}

