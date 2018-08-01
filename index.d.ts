
import * as HEle from "./typings/index";

export as namespace HEle;

export = HEle;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [name: string]: any;
        }
        interface ElementChildrenAttribute {
            children: {};
        }
    }
}
