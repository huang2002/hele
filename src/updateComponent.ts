import { Component } from "./Component";
import { HElement, _eleMap } from "./HElement";
import { _flatten, _clearChildren } from "./utils";

export function _updateComponent(component: Component<any>) {
    const oldElement = _eleMap.get(component);
    if (oldElement) {
        const { node } = oldElement;
        if (node) {
            const { parent } = oldElement,
                nodes = _flatten<Node>([node]);
            nodes.forEach((n, i) => {
                const { parentNode } = n;
                _clearChildren(n, true);
                if (parentNode) {
                    if (i === 0) {
                        const newElement = component.toElement();
                        if (newElement instanceof HElement) {
                            newElement.parent = parent;
                            _eleMap.set(component, newElement);
                            const newNode = newElement.toNode(),
                                newNodes = _flatten<Node>([newNode]),
                                fragment = document.createDocumentFragment();
                            if (parent) {
                                if (parent.node instanceof Array) {
                                    nodes.forEach((n, i) => {
                                        const index = (parent.node as Node[]).indexOf(n);
                                        if (i === 0) {
                                            (parent.node as Node[]).splice(index, 1, ...newNodes);
                                        } else {
                                            (parent.node as Node[]).splice(index, 1);
                                        }
                                    });
                                } else {
                                    parent.node = newNode;
                                }
                            }
                            newNodes.forEach(child => {
                                fragment.appendChild(child);
                            });
                            parentNode.replaceChild(fragment, n);
                        } else {
                            _eleMap.delete(component);
                            parentNode.removeChild(n);
                        }
                    } else {
                        parentNode.removeChild(n);
                    }
                }
            });
        }
    }
}
