import { render, h, Component } from 'preact';
import { Transition, TransitionGroup } from '../src';
import {
	setupCustomMatchers,
	setupScratch,
	createMount,
	teardown
} from './utils';

// Most of the real functionality is covered in other unit tests, this just
// makes sure we're wired up correctly.
describe('TransitionGroup', () => {

	/** @type {HTMLDivElement} */
	let container;

	/** @type {string[]} */
	let log;

	/** @type {import('preact').FunctionalComponent} */
	let Child;

	/** @type {ReturnType<typeof import('./utils').createMount>} */
	let mount;

	beforeEach(() => {
		setupCustomMatchers();
		container = setupScratch();
		mount = createMount(container);

		log = [];
		let events = {
			onEnter: (_, m) => log.push(m ? 'appear' : 'enter'),
			onEntering: (_, m) => log.push(m ? 'appearing' : 'entering'),
			onEntered: (_, m) => log.push(m ? 'appeared' : 'entered'),
			onExit: () => log.push('exit'),
			onExiting: () => log.push('exiting'),
			onExited: () => log.push('exited')
		};

		Child = function Child(props) {
			return (
				<Transition timeout={0} {...props} {...events}>
					<span />
				</Transition>
			);
		};
	});

	afterEach(() => {
		teardown(container);
	});

	it('should allow null components', () => {
		function FirstChild(props) {
			return props.children[0] || null;
		}

		mount(
			<TransitionGroup component={FirstChild}>
				<Child />
			</TransitionGroup>
		);
	});

	it('should allow callback refs', () => {
		const ref = jasmine.createSpy('ref');

		class Child extends Component {
			render() {
				return <span />;
			}
		}

		mount(
			<TransitionGroup>
				<Child ref={ref} />
			</TransitionGroup>
		);

		expect(ref).toHaveBeenCalled();
	});

	it('should work with no children', () => {
		render(<TransitionGroup />, container);
	});

	/*
	it('should handle transitioning correctly', () => {
		function Parent({ count = 1 }) {
			let children = [];
			for (let i = 0; i < count; i++) children.push(<Child key={i} />);
			return (
				<TransitionGroup appear enter exit>
					{children}
				</TransitionGroup>
			);
		}

		jest.useFakeTimers();
		ReactDOM.render(<Parent />, container);

		jest.runAllTimers();
		expect(log).toEqual(['appear', 'appearing', 'appeared']);

		log = [];
		ReactDOM.render(<Parent count={2} />, container);
		jest.runAllTimers();
		expect(log).toEqual(['enter', 'entering', 'entered']);

		log = [];
		ReactDOM.render(<Parent count={1} />, container);
		jest.runAllTimers();
		expect(log).toEqual(['exit', 'exiting', 'exited']);
	});
	*/

	it('should not throw when enter callback is called and is now leaving', () => {
		class Child extends Component {
			componentWillReceiveProps() {
				if (this.callback) {
					this.callback();
				}
			}

			componentWillEnter(callback) {
				this.callback = callback;
			}

			render() {
				return <span />;
			}
		}

		class Parent extends Component {
			render() {
				return <TransitionGroup>{this.props.children}</TransitionGroup>;
			}
		}

		// render the base component
		let root = render(<Parent />, container);
		// now make the child enter
		root = render(
			<Parent>
				<Child key="child" />
			</Parent>,
			container,
			root
		);
		// rendering the child leaving will call 'componentWillProps' which will trigger the
		// callback. This would throw an error previously.
		expect(() => render(<Parent />, container, root)).not.toThrow();
	});

	it('should not throw when leave callback is called and is now entering', () => {
		class Child extends Component {
			componentWillReceiveProps() {
				if (this.callback) {
					this.callback();
				}
			}

			componentWillLeave(callback) {
				this.callback = callback;
			}

			render() {
				return <span />;
			}
		}

		class Parent extends Component {
			render() {
				return <TransitionGroup>{this.props.children}</TransitionGroup>;
			}
		}

		// render the base component
		let root = render(<Parent />, container);
		// now make the child enter
		root = render(
			<Parent>
				<Child key="child" />
			</Parent>,
			container,
			root
		);
		// make the child leave
		root = render(<Parent />, container, root);
		// rendering the child entering again will call 'componentWillProps' which will trigger the
		// callback. This would throw an error previously.
		expect(() =>
			render(
				<Parent>
					<Child key="child" />
				</Parent>,
				container,
				root
			)
		).not.toThrow();
	});
});
