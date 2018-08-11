import { RawProps, Props } from "./props";
import { ComponentGetter } from "./Component";
import { HElement } from "./HElement";
import { _flatten } from "./utils";

export function createElement<P = RawProps>(type: string | ComponentGetter<P>, props?: RawProps & P, ...children: any[]) {
    return new HElement<P>(
        type,
        {
            ...(props || {}),
            children: _flatten(children)
        } as P & Props
    );
}
