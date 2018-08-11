import { HElement } from "./HElement";
import { _clearChildren, _flatten } from "./utils";
import { Ticker } from "./Ticker";

export function render(node: any, root: Node, deepClear = true) {

    _clearChildren(root, deepClear);
    Ticker._tick();

    _flatten([node]).forEach(element => {
        if (element instanceof HElement) {
            _flatten<Node>([element.toNode()]).forEach(child => {
                root.appendChild(child);
            });
        } else if (typeof element === 'string') {
            root.appendChild(document.createTextNode(element));
        } else if (typeof element === 'number') {
            root.appendChild(document.createTextNode(element.toString()));
        }
    });

}
