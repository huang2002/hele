import { Component, ComponentGetter, ComponentFactory, ComponentConstructor } from "./Component";
import { Reference } from "./Reference";
import { render } from "./render";

export interface AnyProps {
    [key: string]: any;
}

export interface RawProps extends AnyProps {
    ref?: Reference;
}

export interface Props extends AnyProps {
    children: any[];
}

export type SpecialPropProcessor<T> = (value: any, target: T) => void;
export const specialNodePropProcessors = new Map<string, SpecialPropProcessor<Node>>([
    ['children', (children, node) => {
        render(children, node);
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
export function sliceEventName(
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
export function getEventOption(
    capture: boolean, nonpassive: boolean, once: boolean
): boolean | AddEventListenerOptions {
    return (!nonpassive && !capture && !once) ?
        false :
        { capture, passive: !nonpassive, once };
}
export function applyPropsToNode(props: Props, node: Node) {
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
                event = sliceEventName(rawEvent, capture, nonpassive, once);
            node.addEventListener(event, value, getEventOption(capture, nonpassive, once));
        } else if (!(key in node) && ('setAttribute' in node)) {
            // @ts-ignore
            node.setAttribute(key, value);
        } else {
            // @ts-ignore
            node[key] = value;
        }
    }
}

export interface ApplyPropsToComponentResult<P extends AnyProps = AnyProps> {
    element: any;
    component: Component<P> | null;
}
export function applyPropsToComponent<P extends AnyProps = AnyProps>(props: Props & P, componentGetter: ComponentGetter<P>) {
    props = Object.assign({}, props);

    const result: ApplyPropsToComponentResult<P> = { element: null, component: null };

    if (componentGetter.prototype instanceof Component) {
        const specialProps = new Map<any, SpecialPropProcessor<Component<any>>>();
        for (const key in props) {
            const processor = specialComponentPropProcessors.get(key);
            if (processor) {
                specialProps.set(props[key], processor);
                delete props[key];
            }
        }
        const component = result.component = new (componentGetter as ComponentConstructor<P>)(props);
        specialProps.forEach((processor, value) => {
            processor(value, component);
        });
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
                delete props[key];
            }
        }
        const element = (componentGetter as ComponentFactory<P>)(props);
        result.element = element;
    }

    return result;

}
