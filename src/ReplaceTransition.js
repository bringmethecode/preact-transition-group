import { Component, h, cloneElement } from 'preact';
import TransitionGroup from './TransitionGroup';

/**
 * The `<ReplaceTransition>` component is a specialized `Transition` component
 * that animates between two children.
 *
 * ```jsx
 * <ReplaceTransition in>
 *   <Fade><div>I appear first</div></Fade>
 *   <Fade><div>I replace the above</div></Fade>
 * </ReplaceTransition>
 * ```
 */
class ReplaceTransition extends Component {
	constructor(props, context) {
		super(props, context);

		this.handleEnter = (...args) => this.handleLifecycle('onEnter', 0, args);
		this.handleEntering = (...args) => this.handleLifecycle('onEntering', 0, args);
		this.handleEntered = (...args) => this.handleLifecycle('onEntered', 0, args);

		this.handleExit = (...args) => this.handleLifecycle('onExit', 1, args);
		this.handleExiting = (...args) => this.handleLifecycle('onExiting', 1, args);
		this.handleExited = (...args) => this.handleLifecycle('onExited', 1, args);
	}

	handleLifecycle(handler, idx, originalArgs) {
		const { children } = this.props;
		const child = children[idx];

		if (child.props[handler]) child.props[handler](...originalArgs);
		if (this.props[handler]) this.props[handler](this.base);
	}

	render() {
		const { children, in: inProp, ...props } = this.props;
		const [first, second] = children;

		// TODO: Use destructuring to remove these props
		delete props.onEnter;
		delete props.onEntering;
		delete props.onEntered;
		delete props.onExit;
		delete props.onExiting;
		delete props.onExited;

		return (
			<TransitionGroup {...props}>
				{inProp
					? cloneElement(first, {
						key: 'first',
						onEnter: this.handleEnter,
						onEntering: this.handleEntering,
						onEntered: this.handleEntered
					  })
					: cloneElement(second, {
						key: 'second',
						onEnter: this.handleExit,
						onEntering: this.handleExiting,
						onEntered: this.handleExited
					  })}
			</TransitionGroup>
		);
	}
}

export default ReplaceTransition;
