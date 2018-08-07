
export as namespace HEle;

export * from "./typings/index";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [name: string]: HEle.RawProps & {
                style?: string | { [key: string]: string };
                class?: string | any[];
            };
        }
        interface ElementChildrenAttribute {
            children: any;
        }
    }
}
