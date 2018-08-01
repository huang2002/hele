import { AnyProps } from "./props";
import { ComponentGetter, ComponentFactory } from "./Component";
import { createElement } from "./createElement";

export function createFactory<P extends AnyProps = AnyProps>(type: string | ComponentGetter<P>) {
    return function (props?: P, ...children: any[]) {
        return createElement(type, props, ...children);
    } as ComponentFactory<P>;
}
