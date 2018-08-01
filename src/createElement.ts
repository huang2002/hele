import { AnyProps, RawProps, Props } from "./props";
import { ComponentGetter } from "./Component";
import { HElement } from "./HElement";
import { flatten } from "./utils";

export function createElement<P = AnyProps>(type: string | ComponentGetter<P>, props?: RawProps & P, ...children: any[]) {
    return new HElement<P>(
        type,
        {
            ...(props || {}),
            children: flatten(children)
        } as P & Props
    );
}
