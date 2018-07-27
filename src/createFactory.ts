import { RawProps } from "./props";
import { ComponentGetter, ComponentFactory } from "./Component";
import { createElement } from "./createElement";

export function createFactory(type: string | ComponentGetter) {
    return function (props?: RawProps, ...children: any[]) {
        return createElement(type, props, ...children);
    } as ComponentFactory;
}
