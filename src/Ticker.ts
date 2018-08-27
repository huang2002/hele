import { Component } from "./Component";
import { _eleMap } from "./HElement";
import { _upCom } from "./updateComponent";
import { _copy } from "./utils";

export const _expired = new Set<Component<any>>();

export type TickMethod = (callback: () => void) => void;

export const defaultTickMethod: TickMethod = callback => {
    requestAnimationFrame(callback);
};

export const Ticker = {

    tickMethod: defaultTickMethod,

    maxUpdateTime: 12,
    maxClearTime: 3,

    _willTick: false,

    _tick() {
        if (!Ticker._willTick) {
            Ticker.tickMethod(() => {
                const { maxUpdateTime, maxClearTime } = Ticker;
                Ticker._willTick = false;
                let startTime = Date.now();

                _expired.forEach(component => {
                    if (Date.now() - startTime < maxUpdateTime) {
                        const { state, updateRequestCallbacks, _forceUp } = component;
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
                            if (_forceUp || component.shouldUpdate(state, newState)) {
                                component._forceUp = false;
                                const snapshot = component.onWillUpdate(state);
                                component.state = newState;
                                _upCom(component);
                                component.onDidUpdate(snapshot);
                            }
                        } catch (error) {
                            component.onUncaughtError(error);
                        }
                    }
                    _expired.delete(component);
                });

                startTime = Date.now();
                let hasElementDeleted = true;
                while (hasElementDeleted && Date.now() - startTime < maxClearTime) {
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

    _mark(component: Component<any>) {
        _expired.add(component);
        Ticker._tick();
    }

};
