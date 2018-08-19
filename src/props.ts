import { Component, ComponentGetter, ComponentFactory, ComponentConstructor } from "./Component";
import { Reference } from "./Reference";
import { render } from "./render";

export interface RawProps {
    [key: string]: any;
    ref?: Reference;
}

export interface Props extends RawProps {
    children: any;
}

export type SpecialPropProcessor<T> = (value: any, target: T) => void;
export const specialNodePropProcessors = new Map<string, SpecialPropProcessor<Node>>([
    ['children', (children, node) => {
        render(children, node, false);
    }],
    ['style', (style, node) => {
        if (!(node instanceof HTMLElement)) {
            return;
        }
        if (style instanceof Object) {
            for (const key in style) {
                // @ts-ignore
                node.style[key] = style[key];
            }
        } else {
            // @ts-ignore
            node.style = style;
        }
    }],
    ['ref', (ref: Reference, node) => {
        ref.current = node;
    }],
    ['class', (classNames: string | any[], node) => {
        if ('setAttribute' in node) {
            (node as Element).setAttribute(
                'class',
                typeof classNames === 'string' ?
                    classNames :
                    classNames.filter(name => typeof name === 'string').join(' ')
            );
        }
    }]
]);
export const specialComponentPropProcessors = new Map<string, SpecialPropProcessor<Component<any>>>([
    ['ref', (ref: Reference, component) => {
        ref.current = component;
    }]
]);
export const specialFactoryPropProcessors = new Map<string, SpecialPropProcessor<undefined>>([
    ['ref', (ref: Reference) => {
        ref.current = undefined;
    }]
]);

const eventPattern = /^on(\w+)$/i,
    captruePattern = /capture/i,
    nonpassivePattern = /nonpassive/i,
    oncePattern = /once/i;
export function _sliceEventName(
    rawEvent: string, useCapture: boolean, nonpassive: boolean, once: boolean
) {
    let t = 0;
    if (useCapture) {
        t += 7;
    }
    if (nonpassive) {
        t += 7;
    }
    if (once) {
        t += 4;
    }
    return t > 0 ? rawEvent.slice(0, -t) : rawEvent;
}
export function _getEventOption(
    capture: boolean, nonpassive: boolean, once: boolean
): boolean | AddEventListenerOptions {
    return (!nonpassive && !capture && !once) ?
        false :
        { capture, passive: !nonpassive, once };
}
export function _createNode(props: Props, node: Node, context: any) {
    // @ts-ignore
    node.context = context;
    for (const key in props) {
        const value = props[key],
            processor = specialNodePropProcessors.get(key);
        if (processor) {
            processor(value, node);
        } else if (key.match(eventPattern)) {
            const rawEvent = RegExp.$1,
                capture = captruePattern.test(rawEvent),
                nonpassive = nonpassivePattern.test(rawEvent),
                once = oncePattern.test(rawEvent),
                event = _sliceEventName(rawEvent, capture, nonpassive, once);
            node.addEventListener(event, value, _getEventOption(capture, nonpassive, once));
        } else if (!(key in node) && ('setAttribute' in node)) {
            (node as Element).setAttribute(key, value);
        } else {
            // @ts-ignore
            node[key] = value;
        }
    }
}

export interface CreateComponentResult<P extends RawProps = RawProps> {
    element: any;
    component: Component<P> | null;
}
export function _createComponent<P extends RawProps = RawProps>(
    componentGetter: ComponentGetter<P>, props: Props & P, context: any
) {

    const result: CreateComponentResult<P> = { element: null, component: null };

    if (componentGetter.prototype instanceof Component) {
        const component = result.component = new (componentGetter as ComponentConstructor<P>)(props, context);
        for (const key in props) {
            const processor = specialComponentPropProcessors.get(key);
            if (processor) {
                processor(props[key], component);
            }
        }
        try {
            component.onWillMount();
        } catch (error) {
            component.onUncaughtError(error);
        }
        result.element = component.toElement();
    } else {
        for (const key in props) {
            const processor = specialFactoryPropProcessors.get(key);
            if (processor) {
                processor(props[key], undefined);
            }
        }
        const element = (componentGetter as ComponentFactory<P>)(props, context);
        result.element = element;
    }

    return result;

}
