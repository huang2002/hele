import { RawProps } from "./props";
import { ComponentGetter } from "./Component";
import { HElement } from "./HElement";
import { flatten } from "./utils";

export function createElement(type: string | ComponentGetter, props?: RawProps, ...children: any[]) {
    return new HElement(
        type,
        {
            ...props,
            children: flatten(children)
        }
    );
}
