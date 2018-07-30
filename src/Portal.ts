import { Component } from "./Component";
import { Props } from "./props";
import { render } from "./render";

export interface PortalProps extends Props {
    container?: Node;
}

export class Portal extends Component<PortalProps> {

    constructor(props: PortalProps) {
        super(props);

        if (props.container) {
            this.container = props.container;
        } else {
            this.container = document.createElement('div');
            document.body.appendChild(this.container);
        }

    }

    readonly container: Node;

    render() {
        return null;
    }

    onWillMount() {
        render(this.props.children, this.container);
    }

}
