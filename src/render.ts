import { HElement } from "./HElement";
import { _clrChd, _flatten } from "./utils";
import { Ticker } from "./Ticker";

export function render(node: any, root: Node, deepClear = true) {

    _clrChd(root, deepClear);
    Ticker._tick();

    // @ts-ignore
    const { context } = root;
    _flatten([node]).forEach(element => {
        if (element instanceof HElement) {
            element.context = context;
            _flatten<Node>([element.toNode()]).forEach(child => {
                root.appendChild(child);
            });
        } else {
            const type = typeof element;
            if (type === 'string') {
                root.appendChild(document.createTextNode(element));
            } else if (type === 'number') {
                root.appendChild(document.createTextNode(element.toString()));
            }
        }
    });

}
