import { Component } from "./Component";

export class Reference<T = Node | Component> {
    current?: T = undefined;
}
