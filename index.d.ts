
import * as HEle from "./typings/index";

export as namespace HEle;

export = HEle;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [name: string]: HEle.RawProps;
            ref?: HEle.Reference;
        }
        interface ElementChildrenAttribute {
            children: any;
        }
    }
}
