import { RawProps } from "./props";
import { ComponentGetter, ComponentFactory } from "./Component";
import { createElement } from "./createElement";

export function createFactory<P extends RawProps = RawProps>(type: string | ComponentGetter<P>) {
    return function ComponentFactory(props?: P, ...children: any[]) {
        return createElement(type, props, ...children);
    } as ComponentFactory<P>;
}
