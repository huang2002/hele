import { HElement } from "./HElement";
import { clearChildNodes, flatten } from "./utils";
import { Ticker } from "./Ticker";

export function render(node: any, root: Node) {

    clearChildNodes(root);
    Ticker.tick();

    flatten([node]).forEach(element => {
        if (element instanceof HElement) {
            element.parent = root;
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
