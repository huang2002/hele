import { RawProps, Props, _crtNode, _crtCom } from "./props";
import { ComponentGetter, ComponentConstructor, Component, Context } from "./Component";
import { _flatten } from "./utils";

export const _eleMap = new Map<Component<any>, HElement<any>>();

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
        let node;
        if (type === null) {
            node = document.createTextNode(props.children[0]);
        } else if (typeof type === 'string') {
            node = document.createElement(type);
            _crtNode(props, node, this.context);
        } else {
            const { element, component } = _crtCom<P>(type, props, this.context),
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
