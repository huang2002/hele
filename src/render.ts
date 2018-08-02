import { HElement } from "./HElement";
import { clearChildNodes, flatten } from "./utils";
import { Ticker } from "./Ticker";

export function render(node: any, root: Node, deepClear = true) {

    clearChildNodes(root, deepClear);
    Ticker.tick();

    flatten([node]).forEach(element => {
        if (element instanceof HElement) {
            flatten<Node>([element.toNode()]).forEach(child => {
                root.appendChild(child);
            });
        } else if (typeof element === 'string') {
            root.appendChild(document.createTextNode(element));
        } else if (typeof element === 'number') {
            root.appendChild(document.createTextNode(element.toString()));
        }
    });

}
