import { Component } from "./Component";
import { elementMap } from "./HElement";
import { updateComponent } from "./updateComponent";

export const expiredComponents = new Set<Component<any>>();

export type TickMethod = (callback: () => void) => void;

export const defaultTickMethod: TickMethod = callback => {
    requestAnimationFrame(callback);
};

export const Ticker = {

    tickMethod: defaultTickMethod,

    maxClearCountPerTick: 100,
    maxUpdateCountPerTick: 100,

    willTick: false,

    tick() {
        if (!Ticker.willTick) {
            Ticker.tickMethod(() => {
                Ticker.willTick = false;

                let updateCount = 0;
                expiredComponents.forEach(component => {
                    if (updateCount++ < Ticker.maxUpdateCountPerTick) {
                        const { state, updateRequestCallbacks } = component,
                            newState = updateRequestCallbacks.reduce((s, cb) => cb(s), { ...state });
                        updateRequestCallbacks.length = 0;
                        try {
                            if (component.shouldUpdate(state, newState)) {
                                const snapshot = component.onWillUpdate(state);
                                Object.assign(state, newState);
                                component.onDidUpdate(snapshot);
                                updateComponent(component);
                            }
                        } catch (error) {
                            component.onUncaughtError(error);
                        }
                    }
                    expiredComponents.delete(component);
                });

                const { maxClearCountPerTick } = Ticker;
                let hasElementDeleted = true,
                    clearCount = 0;
                while (hasElementDeleted && clearCount++ < maxClearCountPerTick) {
                    hasElementDeleted = false;
                    elementMap.forEach((element, component) => {
                        const { node } = element;
                        if (node) {
                            if (!(node instanceof Array ? node[0] : node).parentNode) {
                                hasElementDeleted = true;
                                try {
                                    component.onWillUnmount();
                                    elementMap.delete(component);
                                    component.onDidUnmount();
                                } catch (error) {
                                    component.onUncaughtError(error);
                                }
                            }
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
