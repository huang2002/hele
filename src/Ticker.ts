import { Component } from "./Component";
import { elementMap, HElement } from "./HElement";
import { clearChildNodes, flatten } from "./utils";

export const expiredComponents = new Set<Component<any>>();

export type TickMethod = (callback: () => void) => void;

export const defaultTickMethod: TickMethod = callback => {
    requestAnimationFrame(callback);
};

export function updateComponent(component: Component<any>) {
    const oldElement = elementMap.get(component);
    if (oldElement) {
        const { node } = oldElement;
        if (node) {
            flatten<Node>([node]).forEach((n, i) => {
                clearChildNodes(n);
                const { parentNode } = n;
                if (parentNode) {
                    if (i === 0) {
                        const newElement = component.toElement();
                        if (newElement instanceof HElement) {
                            elementMap.set(component, newElement);
                            const newNode = newElement.toNode(),
                                fragment = document.createDocumentFragment();
                            flatten<Node>([newNode]).forEach(child => {
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

export const Ticker = {

    tickMethod: defaultTickMethod,

    maxCheckCountPerTick: 100,

    willTick: false,

    tick() {
        if (!Ticker.willTick) {
            Ticker.tickMethod(() => {
                Ticker.willTick = false;

                expiredComponents.forEach(component => {
                    const { states, updateRequestCallbacks } = component,
                        newStates = { ...states };
                    updateRequestCallbacks.forEach(callback => {
                        Object.assign(newStates, callback(newStates));
                    });
                    updateRequestCallbacks.length = 0;
                    try {
                        if (component.shouldUpdate(states, newStates)) {
                            const snapshot = component.onWillUpdate();
                            Object.assign(states, newStates);
                            component.onDidUpdate(snapshot);
                            updateComponent(component);
                        }
                    } catch (error) {
                        component.onUncaughtError(error);
                    }
                });
                expiredComponents.clear();

                const { maxCheckCountPerTick } = Ticker;
                let hasElementDeleted = true,
                    checkCount = 0;
                while (hasElementDeleted && checkCount++ < maxCheckCountPerTick) {
                    hasElementDeleted = false;
                    elementMap.forEach((element, component) => {
                        const { node } = element;
                        if (node) {
                            flatten<Node>([node]).forEach(n => {
                                if (!n.parentNode) {
                                    clearChildNodes(n);
                                    hasElementDeleted = true;
                                    try {
                                        component.onWillUnmount();
                                        elementMap.delete(component);
                                        component.onDidUnmount();
                                    } catch (error) {
                                        component.onUncaughtError(error);
                                    }
                                }
                            });
                        }
                    });
                }

            });
            Ticker.willTick = true;
        }
    },

    updateComponent(component: Component<any>) {
        expiredComponents.add(component);
        Ticker.tick();
    }

};
