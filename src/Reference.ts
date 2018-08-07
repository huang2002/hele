import { Component } from "./Component";

export class Reference<C extends Component = Component> {
    current?: Node | C = undefined;
}
