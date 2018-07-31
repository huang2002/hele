import { RawProps, Props } from "./props";
import { ComponentGetter, ComponentFactory } from "./Component";
import { createElement } from "./createElement";

export function createFactory<P extends Props = Props>(type: string | ComponentGetter<P>) {
    return function (props?: RawProps & P, ...children: any[]) {
        return createElement(type, props, ...children);
    } as ComponentFactory<P>;
}
