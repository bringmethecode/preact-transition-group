import { h, Component, render, rerender } from 'preact';
import hasClass from 'dom-helpers/class/hasClass';
import CSSTransition from '../src/CSSTransition';
import TransitionGroup from '../src/TransitionGroup';
import { setupScratch, setupCustomMatchers, teardown } from './utils';

/* global spyOn */

// Most of the real functionality is covered in other unit tests, this just
// makes sure we're wired up correctly.
describe('CSSTransitionGroup', () => {
	let container;

	function YoloTransition({ id, ...props }) {
		return (
			<CSSTransition classNames="yolo" timeout={0} {...props}>
				<span id={id} />
			</CSSTransition>
		);
	}

	beforeEach(() => {
		jasmine.clock().install();

		container = setupScratch();
		setupCustomMatchers();

		spyOn(console, 'error');
	});

	afterEach(() => {
		jasmine.clock().uninstall();
		teardown(container);
	});

	it('should clean-up silently after the timeout elapses', () => {
		let root = render(
			<TransitionGroup enter={false}>
				<YoloTransition key="one" id="one" />
			</TransitionGroup>,
			container
		);

		expect(root.childNodes).toHaveLength(1);

		root = render(
			<TransitionGroup enter={false}>
				<YoloTransition key="two" id="two" />
			</TransitionGroup>,
			container,
			root
		);
		expect(root.childNodes).toHaveLength(2);
		expect(root.childNodes[0].id).toBe('two');
		expect(root.childNodes[1].id).toBe('one');

		rerender(); // exiting
		jasmine.clock().tick(10);
		rerender(); // exited
		rerender(); // unmount

		// No warnings
		expect(console.error.calls.count()).toBe(0);

		// The leaving child has been removed
		expect(root.childNodes).toHaveLength(1);
		expect(root.childNodes[0].id).toBe('two');
	});

	/*
	it('should keep both sets of DOM nodes around', () => {
		let a = ReactDOM.render(
			<TransitionGroup>
				<YoloTransition key="one" id="one" />
			</TransitionGroup>,
			container
		);
		expect(ReactDOM.findDOMNode(a).childNodes).toHaveLength(1);
		ReactDOM.render(
			<TransitionGroup>
				<YoloTransition key="two" id="two" />
			</TransitionGroup>,
			container
		);
		expect(ReactDOM.findDOMNode(a).childNodes).toHaveLength(2);
		expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('two');
		expect(ReactDOM.findDOMNode(a).childNodes[1].id).toBe('one');
	});

	it('should switch transitionLeave from false to true', () => {
		let a = ReactDOM.render(
			<TransitionGroup enter={false} leave={false}>
				<YoloTransition key="one" id="one" />
			</TransitionGroup>,
			container
		);
		expect(ReactDOM.findDOMNode(a).childNodes).toHaveLength(1);
		ReactDOM.render(
			<TransitionGroup enter={false} leave={false}>
				<YoloTransition key="two" id="two" />
			</TransitionGroup>,
			container
		);

		jest.runAllTimers();
		expect(ReactDOM.findDOMNode(a).childNodes).toHaveLength(1);
		ReactDOM.render(
			<TransitionGroup enter={false} leave>
				<YoloTransition key="three" id="three" />
			</TransitionGroup>,
			container
		);
		expect(ReactDOM.findDOMNode(a).childNodes).toHaveLength(2);
		expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('three');
		expect(ReactDOM.findDOMNode(a).childNodes[1].id).toBe('two');
	});

	it('should work with a null child', () => {
		ReactDOM.render(
			<TransitionGroup>
				{[null]}
			</TransitionGroup>,
			container
		);
	});

	it('should work with a child which renders as null', () => {
		const NullComponent = () => null;
		// Testing the whole lifecycle of entering and exiting,
		// because those lifecycle methods used to fail when the DOM node was null.
		ReactDOM.render(
			<TransitionGroup />,
			container
		);
		ReactDOM.render(
			<TransitionGroup>
				<CSSTransition classNames="yolo" timeout={0}>
					<NullComponent />
				</CSSTransition>
			</TransitionGroup>,
			container
		);
		ReactDOM.render(
			<TransitionGroup />,
			container
		);
	});

	it('should transition from one to null', () => {
		let a = ReactDOM.render(
			<TransitionGroup>
				<YoloTransition key="one" id="one" />
			</TransitionGroup>,
			container
		);
		expect(ReactDOM.findDOMNode(a).childNodes).toHaveLength(1);
		ReactDOM.render(
			<TransitionGroup>
				{null}
			</TransitionGroup>,
			container
		);
		// (Here, we expect the original child to stick around but test that no
		// exception is thrown)
		expect(ReactDOM.findDOMNode(a).childNodes).toHaveLength(1);
		expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('one');
	});

	it('should transition from false to one', () => {
		let a = ReactDOM.render(
			<TransitionGroup>
				{false}
			</TransitionGroup>,
			container
		);
		expect(ReactDOM.findDOMNode(a).childNodes).toHaveLength(0);
		ReactDOM.render(
			<TransitionGroup>
				<YoloTransition key="one" id="one" />
			</TransitionGroup>,
			container
		);
		expect(ReactDOM.findDOMNode(a).childNodes).toHaveLength(1);
		expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('one');
	});

	it('should clear transition timeouts when unmounted', () => {
		class Component extends React.Component {
			render() {
				return (
					<TransitionGroup>
						{this.props.children}
					</TransitionGroup>
				);
			}
		}

		ReactDOM.render(<Component />, container);
		ReactDOM.render(
			<Component>
				<YoloTransition key="yolo" id="yolo" />
			</Component>,
			container
		);

		ReactDOM.unmountComponentAtNode(container);

		// Testing that no exception is thrown here, as the timeout has been cleared.
		jest.runAllTimers();
	});

	it('should handle unmounted elements properly', () => {
		class Child extends React.Component {
			render() {
				if (!this.props.show) return null;
				return <div />;
			}
		}

		class Component extends React.Component {
			state = { showChild: true };

			componentDidMount() {
				this.setState({ showChild: false });
			}

			render() {
				return (
					<TransitionGroup appear>
						<Child show={this.state.showChild} />
					</TransitionGroup>
				);
			}
		}

		ReactDOM.render(<Component />, container);

		// Testing that no exception is thrown here, as the timeout has been cleared.
		jest.runAllTimers();
	});

	it('should work with custom component wrapper cloning children', () => {
		const extraClassNameProp = 'wrapper-item';
		class Wrapper extends React.Component {
			render() {
				return (
					<div>
						{
							React.Children.map(this.props.children,
								child => React.cloneElement(child, { className: extraClassNameProp }))
						}
					</div>
				);
			}
		}

		class Child extends React.Component {
			render() {
				return <div {...this.props} />;
			}
		}

		class Component extends React.Component {
			render() {
				return (
					<TransitionGroup
						component={Wrapper}
					>
						<Child />
					</TransitionGroup>
				);
			}
		}

		const a = ReactDOM.render(<Component />, container);
		const child = ReactDOM.findDOMNode(a).childNodes[0];
		expect(hasClass(child, extraClassNameProp)).toBe(true);

		// Testing that no exception is thrown here, as the timeout has been cleared.
		jest.runAllTimers();
	});
	*/
});
