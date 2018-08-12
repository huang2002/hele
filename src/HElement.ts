import { RawProps, Props, _createNode, _createComponent } from "./props";
import { ComponentGetter, ComponentConstructor, Component, Context } from "./Component";
import { _flatten } from "./utils";

export const _eleMap = new Map<Component<any>, HElement<any>>();

export function _parseEle(element: any): HElement | null | (HElement | null)[] {
    if (element instanceof HElement) {
        return element;
    } else if (element instanceof Array) {
        return element.map(_parseEle) as (HElement | null)[];
    } else {
        return null;
    }
}

export function _toNode(
    element: null | HElement | (HElement | null)[]
): Node | Node[] {
    if (element instanceof HElement) {
        return element.toNode();
    } else if (element instanceof Array) {
        return _flatten(element.map(_toNode) as Node[]);
    } else {
        return document.createTextNode('');
    }
}

export class HElement<P extends RawProps = RawProps> {

    constructor(
        public readonly type: string | ComponentGetter<P>,
        props: Props & P
    ) {
        this.props = (typeof type !== 'string' && type.prototype instanceof Component) ?
            Object.assign({}, (type as ComponentConstructor<P>).defaultProps, props) :
            props;
    }

    readonly props: Props & P;
    parent?: HElement<any> = undefined;
    node?: Node | Node[] = undefined;
    context: any = undefined;

    toNode(): Node | Node[] {
        const { type, props } = this;
        let node;
        if (typeof type === 'string') {
            node = document.createElement(type);
            _createNode(props, node);
        } else {
            const { element, component } = _createComponent<P>(type, props, this.context),
                parsedElement = _parseEle(element);
            // @ts-ignore
            if (type === Context) {
                this.context = component!.state;
            }
            if (parsedElement) {
                const { context } = this;
                _flatten<HElement | null>([parsedElement]).forEach(ele => {
                    if (ele) {
                        ele.parent = this;
                        ele.context = context;
                    }
                });
            }
            node = parsedElement instanceof Array ?
                _flatten<Node>(parsedElement.map(_toNode)) :
                _toNode(parsedElement);
            if (component) {
                _eleMap.set(component, this);
                try {
                    component.onDidMount();
                } catch (error) {
                    component.onUncaughtError(error);
                }
            }
        }
        return this.node = node;
    }

}
