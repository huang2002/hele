import { Component, Context } from "./Component";
import { createElement } from "./createElement";
import { Props } from "./props";
import { render } from "./render";

export interface PortalProps extends Props {
    container?: Node;
    deepClear?: boolean;
}

export class Portal extends Component<PortalProps> {

    constructor(props: PortalProps, context: any) {
        super(props, context);

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
        render(
            createElement(
                Context,
                { value: this.context },
                this.props.children
            ),
            this.container,
            this.props.deepClear
        );
    }

}
