import { ComponentFactory } from "./Component";
import { flatten } from "./utils";

export interface FragmentProps {
    children: any[];
}

export const Fragment: ComponentFactory<FragmentProps> = function (props) {
    return flatten(props.children);
};
