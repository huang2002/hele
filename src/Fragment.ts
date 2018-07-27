import { ComponentFactory } from "./Component";
import { flatten } from "./utils";

export const Fragment: ComponentFactory = function (props) {
    return flatten(props.children);
};
