import { Component } from "./Component";
import { elementMap, HElement } from "./HElement";
import { flatten } from "./utils";

export function updateComponent(component: Component<any>) {
    const oldElement = elementMap.get(component);
    if (oldElement) {
        const { node } = oldElement;
        if (node) {
            const { parent } = oldElement,
                nodes = flatten<Node>([node]);
            nodes.forEach((n, i) => {
                const { parentNode } = n;
                if (parentNode) {
                    if (i === 0) {
                        const newElement = component.toElement();
                        if (newElement instanceof HElement) {
                            newElement.parent = parent;
                            elementMap.set(component, newElement);
                            const newNode = newElement.toNode(),
                                newNodes = flatten<Node>([newNode]),
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
                            elementMap.delete(component);
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
