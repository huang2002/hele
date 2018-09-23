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
                Ticker._willTick = false;

                const { maxUpdateTime, maxClearTime } = Ticker;

                let startTime = Date.now();

                _expired.forEach(component => {
                    if (Date.now() - startTime < maxUpdateTime) {
                        _expired.delete(component);
                        const { state, updateRequestCallbacks, _forceUp } = component,
                            callbacks = updateRequestCallbacks.slice(0),
                            callbackCount = callbacks.length;
                        let newState = _copy(state),
                            t;
                        callbacks.forEach(callback => {
                            t = callback(newState);
                            if (t !== undefined) {
                                newState = t;
                            }
                        });
                        component.updateRequestCallbacks = updateRequestCallbacks.slice(callbackCount);
                        try {
                            if (_forceUp || component.shouldUpdate(state, newState)) {
                                component._forceUp = false;
                                const snapshot = component.onWillUpdate(state);
                                component.state = newState;
                                _upCom(component);
                                component.onDidUpdate(snapshot);
                            }
                        } catch (error) {
                            component.onCaughtError(error);
                        }
                    }
                });

                if (_expired.size) {
                    Ticker._tick();
                }

                startTime = Date.now();
                let hasElementDeleted = true;
                while (hasElementDeleted && Date.now() - startTime < maxClearTime) {
                    hasElementDeleted = false;
                    _eleMap.forEach((element, component) => {
                        const { node } = element;
                        if (node) {
                            const tempNode = (node instanceof Array ? node[0] : node);
                            if (!tempNode || !tempNode.parentNode) {
                                hasElementDeleted = true;
                                try {
                                    component.onWillUnmount();
                                    _eleMap.delete(component);
                                    component.onDidUnmount();
                                } catch (error) {
                                    component.onCaughtError(error);
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
