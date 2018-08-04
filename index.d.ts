
import * as HEle from "./typings/index";

export as namespace HEle;

export = HEle;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [name: string]: HEle.RawProps;
        }
        interface ElementChildrenAttribute {
            children: any;
        }
    }
}
