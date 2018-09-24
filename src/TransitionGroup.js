import { Component, h } from 'preact';

import {
	getChildMapping,
	getInitialChildMapping,
	getNextChildMapping
} from './utils/ChildMapping';

const values = Object.values || (obj => Object.keys(obj).map(k => obj[k]));

const defaultProps = {
	component: 'div',
	childFactory: child => child
};

/**
 * The `<TransitionGroup>` component manages a set of transition components
 * (`<Transition>` and `<CSSTransition>`) in a list. Like with the transition
 * components, `<TransitionGroup>` is a state machine for managing the mounting
 * and unmounting of components over time.
 *
 * Consider the example below. As items are removed or added to the TodoList the
 * `in` prop is toggled automatically by the `<TransitionGroup>`.
 *
 * Note that `<TransitionGroup>`  does not define any animation behavior!
 * Exactly _how_ a list item animates is up to the individual transition
 * component. This means you can mix and match animations across different list
 * items.
 */
class TransitionGroup extends Component {
	constructor(props, context) {
		super(props, context);

		const handleExited = this.handleExited.bind(this);

		// Initial children should all be entering, dependent on appear
		this.state = {
			handleExited,
			firstRender: true
		};
	}

	getChildContext() {
		return {
			transitionGroup: { isMounting: !this.appeared }
		};
	}

	componentDidMount() {
		this.appeared = true;
	}

	static getDerivedStateFromProps(
		nextProps,
		{ children: prevChildMapping, handleExited, firstRender }
	) {
		return {
			children: firstRender
				? getInitialChildMapping(nextProps, handleExited)
				: getNextChildMapping(nextProps, prevChildMapping, handleExited),
			firstRender: false
		};
	}

	handleExited(child, node) {
		let currentChildMapping = getChildMapping(this.props.children);

		if (child.key in currentChildMapping) return;

		if (child.props.onExited) {
			child.props.onExited(node);
		}

		this.setState(state => {
			let children = { ...state.children };

			delete children[child.key];
			return { children };
		});
	}

	render() {
		const { component: Component, childFactory, ...props } = this.props;
		const children = values(this.state.children).map(childFactory);

		delete props.appear;
		delete props.enter;
		delete props.exit;

		if (Component === null) {
			return children;
		}
		return <Component {...props}>{children}</Component>;
	}
}

TransitionGroup.defaultProps = defaultProps;

export default TransitionGroup;
