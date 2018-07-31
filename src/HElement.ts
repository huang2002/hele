import { Props, applyPropsToNode, applyPropsToComponent } from "./props";
import { ComponentGetter, ComponentConstructor, Component } from "./Component";
import { parsePossibleElement, flatten } from "./utils";

export const elementMap = new Map<Component, HElement<any>>();

export function convertPossibleElementToNode(
    element: null | HElement | (HElement | null)[]
): Node | Node[] {
    if (element instanceof HElement) {
        return element.toNode();
    } else if (element instanceof Array) {
        return flatten(element.map(convertPossibleElementToNode) as Node[]);
    } else {
        return document.createTextNode('');
    }
}

export class HElement<P extends Props = Props> {

    constructor(
        public readonly type: string | ComponentGetter<P>,
        props: Props & P
    ) {
        this.props = (typeof type !== 'string' && type.prototype instanceof Component) ?
            Object.assign({}, (type as ComponentConstructor<P>).defaultProps, props) :
            props;
    }

    readonly props: Props & P;
    parent?: Node = undefined;
    node?: Node | Node[] = undefined;

    toNode(): Node | Node[] {
        const { type, props } = this;
        let node;
        if (typeof type === 'string') {
            node = document.createElement(type);
            applyPropsToNode(props, node);
        } else {
            const { element, component } = applyPropsToComponent<P>(props, type),
                parsedElement = parsePossibleElement(element);
            node = parsedElement instanceof Array ?
                flatten(parsedElement.map(convertPossibleElementToNode) as Node[]) :
                convertPossibleElementToNode(parsedElement);
            if (component) {
                elementMap.set(component, this);
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
