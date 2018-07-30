import { RawProps, Props } from "./props";
import { ComponentGetter } from "./Component";
import { HElement } from "./HElement";
import { flatten } from "./utils";

export function createElement<T = RawProps>(type: string | ComponentGetter<T & Props>, props?: RawProps & T, ...children: any[]) {
    return new HElement<T & Props>(
        type,
        {
            ...(props || {}),
            children: flatten(children)
        } as T & Props
    );
}
