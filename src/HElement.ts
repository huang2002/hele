import { RawProps, Props, _crtNode, _getCom } from "./props";
import { ComponentGetter, ComponentConstructor, Component, Context } from "./Component";
import { _flatten, _copy } from "./utils";

export const _eleMap = new Map<Component<any>, HElement<any>>();

export const namespaces = new Map([
    ['svg', 'http://www.w3.org/2000/svg']
]);

export const _nsCtxName = '_xmlns';

export function _toEle(element: any): HElement<any> | null | (HElement<any> | null)[] {
    if (element instanceof HElement) {
        return element;
    } else {
        const type = typeof element;
        if (type === 'string') {
            return new HElement(null, { children: [element] });
        } else if (type === 'number') {
            return new HElement(null, { children: [element.toString()] });
        } else if (element instanceof Array) {
            return element.map(_toEle) as (HElement | null)[];
        } else {
            return null;
        }
    }
}

export function _toNode(
    element: null | HElement | (HElement | null)[]
): Node | Node[] {
    if (element instanceof HElement) {
        return element.toNode();
    } else if (element instanceof Array) {
        return _flatten<Node>(element.map(_toNode));
    } else {
        return document.createTextNode('');
    }
}

export class HElement<P extends RawProps = RawProps> {

    constructor(
        public readonly type: string | null | ComponentGetter<P>,
        props: Props & P
    ) {
        this.props = (type && typeof type !== 'string' && type.prototype instanceof Component) ?
            Object.assign({}, (type as ComponentConstructor<P>).defaultProps, props) :
            props;
    }

    readonly props: Props & P;
    parent?: HElement<any> = undefined;
    node?: Node | Node[] = undefined;
    context: any = undefined;

    toNode(): Node | Node[] {
        const { type, props } = this;
        let node: Node | Node[];
        if (type === null) {
            node = document.createTextNode(props.children[0]);
        } else if (typeof type === 'string') {
            const context = _copy(this.context),
                xmlns = !props['no-xmlns'] &&
                    (props.xmlns || namespaces.get(type) || context[_nsCtxName]);
            node = xmlns ?
                document.createElementNS(xmlns, type) :
                document.createElement(type);
            if (xmlns) {
                context[_nsCtxName] = xmlns;
            }
            _crtNode(props, node, context);
        } else {
            const { element, component } = _getCom<P>(type, props, _copy(this.context)),
                parsedElement = _toEle(element);
            // @ts-ignore
            if (type === Context) {
                this.context = component!.state;
            }
            if (parsedElement) {
                const { context } = this;
                _flatten<HElement | null>([parsedElement]).forEach(ele => {
                    if (ele) {
                        ele.parent = this;
                        ele.context = _copy(context);
                    }
                });
            }
            if (component) {
                _eleMap.set(component, this);
            }
            try {
                node = parsedElement instanceof Array ?
                    _flatten<Node>(parsedElement.map(_toNode)) :
                    _toNode(parsedElement);
                if (component) {
                    component.onDidMount();
                }
            } catch (error) {
                node = document.createTextNode('');
                if (component) {
                    component.onCaughtError(error);
                } else {
                    throw error;
                }
            }
        }
        return this.node = node;
    }

}
