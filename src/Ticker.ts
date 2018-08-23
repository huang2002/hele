import { Component } from "./Component";
import { _eleMap } from "./HElement";
import { _updateComponent } from "./updateComponent";
import { _copy } from "./utils";

export const _expiredComponents = new Set<Component<any>>();

export type TickMethod = (callback: () => void) => void;

export const defaultTickMethod: TickMethod = callback => {
    requestAnimationFrame(callback);
};

export const Ticker = {

    tickMethod: defaultTickMethod,

    maxClearCountPerTick: 100,
    maxUpdateCountPerTick: 100,

    _willTick: false,

    _tick() {
        if (!Ticker._willTick) {
            Ticker.tickMethod(() => {
                Ticker._willTick = false;

                let updateCount = 0;
                _expiredComponents.forEach(component => {
                    if (updateCount++ < Ticker.maxUpdateCountPerTick) {
                        const { state, updateRequestCallbacks } = component;
                        let newState = _copy(state),
                            t;
                        updateRequestCallbacks.forEach(callback => {
                            t = callback(newState);
                            if (t !== undefined) {
                                newState = t;
                            }
                        });
                        updateRequestCallbacks.length = 0;
                        try {
                            if (component.shouldUpdate(state, newState)) {
                                const snapshot = component.onWillUpdate(state);
                                component.state = newState;
                                component.onDidUpdate(snapshot);
                                _updateComponent(component);
                            }
                        } catch (error) {
                            component.onUncaughtError(error);
                        }
                    }
                    _expiredComponents.delete(component);
                });

                const { maxClearCountPerTick } = Ticker;
                let hasElementDeleted = true,
                    clearCount = 0;
                while (hasElementDeleted && clearCount++ < maxClearCountPerTick) {
                    hasElementDeleted = false;
                    _eleMap.forEach((element, component) => {
                        const { node } = element;
                        if (node) {
                            if (!(node instanceof Array ? node[0] : node).parentNode) {
                                hasElementDeleted = true;
                                try {
                                    component.onWillUnmount();
                                    _eleMap.delete(component);
                                    component.onDidUnmount();
                                } catch (error) {
                                    component.onUncaughtError(error);
                                }
                            }
                        }
                    });
                }

            });
            Ticker._willTick = true;
        }
    },

    _updateComponent(component: Component<any>) {
        _expiredComponents.add(component);
        Ticker._tick();
    }

};
