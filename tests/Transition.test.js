import { h, render, Component } from 'preact';
import sinon from 'sinon';
import { createMount, setupCustomMatchers, setupScratch, teardown } from './utils';

import Transition, {
	UNMOUNTED,
	EXITED,
	ENTERING,
	ENTERED,
	EXITING
} from '../src/Transition';

describe('Transition', () => {

	/** @type {HTMLDivElement} */
	let scratch;

	/** @type {ReturnType<typeof import('./utils').createMount>} */
	let mount;

	beforeEach(() => {
		setupCustomMatchers();
		scratch = setupScratch();
		mount = createMount(scratch);
	});

	afterEach(() => {
		teardown(scratch);
	});

	it('should not transition on mount', () => {

		/** @type {Transition} */
		let transition;

		render(
			<Transition
				in
				timeout={0}
				onEnter={() => {
					throw new Error('should not Enter');
				}}
				ref={c => transition = c}
			>
				<div />
			</Transition>,
			scratch
		);

		expect(transition.state.status).toEqual(ENTERED);
	});

	it('should transition on mount with `appear`', done => {
		// Enzyme's mount always starts from scratch with each call
		// so mimicing that here by destroying scratch between calls
		// and recreating the mount function
		// TODO: Investigate more closely matching enzyme's functionality
		// of havin mount manage scratch internally...
		createMount(scratch)(
			<Transition
				in
				timeout={0}
				onEnter={() => {
					throw Error('Animated!');
				}}
			>
				<div />
			</Transition>
		);

		teardown(scratch);
		scratch = setupScratch();

		createMount(scratch)(
			<Transition in appear timeout={0} onEnter={() => done()}>
				<div />
			</Transition>
		);
	});

	it('should pass filtered props to children', () => {

		/** @type {Child} */
		let child;

		class Child extends Component {
			render() {
				return <div>child</div>;
			}
		}

		render(
			<Transition
				foo="foo"
				bar="bar"
				in
				mountOnEnter
				unmountOnExit
				appear
				enter
				exit
				timeout={0}
				addEndListener={() => {}}
				onEnter={() => {}}
				onEntering={() => {}}
				onEntered={() => {}}
				onExit={() => {}}
				onExiting={() => {}}
				onExited={() => {}}
			>
				<Child ref={c => child = c} />
			</Transition>,
			scratch
		);

		expect(child.props).toEqual({ foo: 'foo', bar: 'bar', children: [] });
	});

	it('should allow addEndListener instead of timeouts', done => {
		let listener = sinon.spy((node, end) => setTimeout(end, 0));

		let inst = mount(
			<Transition
				addEndListener={listener}
				onEntered={() => {
					expect(listener.callCount).toEqual(1);
					done();
				}}
			>
				<div />
			</Transition>
		);

		inst.setProps({ in: true });
	});

	it('should fallback to timeouts with addEndListener', done => {
		let calledEnd = false;
		let listener = (node, end) =>
			setTimeout(() => {
				calledEnd = true;
				end();
			}, 100);

		let inst = mount(
			<Transition
				timeout={0}
				addEndListener={listener}
				onEntered={() => {
					expect(calledEnd).toEqual(false);
					done();
				}}
			>
				<div />
			</Transition>
		);

		inst.setProps({ in: true });
	});

	describe('entering', () => {
		let wrapper;

		beforeEach(() => {
			wrapper = mount(
				<Transition timeout={10}>
					<div />
				</Transition>
			);
		});

		it('should fire callbacks', done => {
			let onEnter = sinon.spy();
			let onEntering = sinon.spy();

			expect(wrapper.state('status')).toEqual(EXITED);

			wrapper.setProps({
				in: true,

				onEnter,

				onEntering,

				onEntered() {
					expect(onEnter.calledOnce).toEqual(true);
					expect(onEntering.calledOnce).toEqual(true);
					expect(onEnter.calledBefore(onEntering)).toEqual(true);
					done();
				}
			});
		});

		it('should move to each transition state', done => {
			let count = 0;

			expect(wrapper.state('status')).toEqual(EXITED);

			wrapper.setProps({
				in: true,

				onEnter() {
					count++;
					expect(wrapper.state('status')).toEqual(EXITED);
				},

				onEntering() {
					count++;
					expect(wrapper.state('status')).toEqual(ENTERING);
				},

				onEntered() {
					expect(wrapper.state('status')).toEqual(ENTERED);
					expect(count).toEqual(2);
					done();
				}
			});
		});
	});

	describe('exiting', () => {
		let wrapper;

		beforeEach(() => {
			wrapper = mount(
				<Transition in timeout={10}>
					<div />
				</Transition>
			);
		});

		it('should fire callbacks', done => {
			let onExit = sinon.spy();
			let onExiting = sinon.spy();

			expect(wrapper.state('status')).toEqual(ENTERED);

			wrapper.setProps({
				in: false,

				onExit,

				onExiting,

				onExited() {
					expect(onExit.calledOnce).toEqual(true);
					expect(onExiting.calledOnce).toEqual(true);
					expect(onExit.calledBefore(onExiting)).toEqual(true);
					done();
				}
			});
		});

		it('should move to each transition state', done => {
			let count = 0;

			expect(wrapper.state('status')).toEqual(ENTERED);

			wrapper.setProps({
				in: false,

				onExit() {
					count++;
					expect(wrapper.state('status')).toEqual(ENTERED);
				},

				onExiting() {
					count++;
					expect(wrapper.state('status')).toEqual(EXITING);
				},

				onExited() {
					expect(wrapper.state('status')).toEqual(EXITED);
					expect(count).toEqual(2);
					done();
				}
			});
		});
	});

	// NOTE:  Preact mounts an empty text node for null renders so instead
	// of checking for the existance of a DOM node, validate expected innerHTML

	describe('mountOnEnter', () => {
		class MountTransition extends Component {
			constructor(props) {
				super(props);
				this.state = { in: props.initialIn };

				this.getStatus = () => this.transition.state.status;
			}

			render() {
				const { ...props } = this.props;
				delete props.initialIn;

				return (
					<Transition
						ref={c => (this.transition = c)}
						mountOnEnter
						in={this.state.in}
						timeout={10}
						{...props}
					>
						<div />
					</Transition>
				);
			}
		}

		it('should mount when entering', done => {
			const wrapper = mount(
				<MountTransition
					initialIn={false}
					onEnter={() => {
						expect(wrapper.instance().getStatus()).toEqual(EXITED);

						// expect(wrapper.getDOMNode()).toExist();
						expect(scratch.innerHTML).toBe('<div></div>');

						done();
					}}
				/>
			);

			expect(wrapper.instance().getStatus()).toEqual(UNMOUNTED);

			// expect(wrapper.getDOMNode()).not.toExist();
			expect(scratch.innerHTML).toBe('');

			wrapper.setProps({ in: true });
		});

		it('should stay mounted after exiting', done => {
			const wrapper = mount(
				<MountTransition
					initialIn={false}
					onEntered={() => {
						expect(wrapper.instance().getStatus()).toEqual(ENTERED);

						// expect(wrapper.getDOMNode()).not.toExist();
						expect(scratch.innerHTML).toBe('<div></div>');

						wrapper.setState({ in: false });
					}}
					onExited={() => {
						expect(wrapper.instance().getStatus()).toEqual(EXITED);

						// expect(wrapper.getDOMNode()).not.toExist();
						expect(scratch.innerHTML).toBe('<div></div>');

						done();
					}}
				/>
			);

			// expect(wrapper.getDOMNode()).not.toExist();
			expect(scratch.innerHTML).toBe('');

			wrapper.setState({ in: true });
		});
	});

	describe('unmountOnExit', () => {
		class UnmountTransition extends Component {
			constructor(props) {
				super(props);

				this.state = { in: props.initialIn };

				this.getStatus = () => this.transition.state.status;
			}

			render() {
				const { ...props } = this.props;
				delete props.initialIn;

				return (
					<Transition
						ref={c => (this.transition = c)}
						unmountOnExit
						in={this.state.in}
						timeout={10}
						{...props}
					>
						<div />
					</Transition>
				);
			}
		}

		it('should mount when entering', done => {
			const wrapper = mount(
				<UnmountTransition
					initialIn={false}
					onEnter={() => {
						expect(wrapper.instance().getStatus()).toEqual(EXITED);
						// expect(wrapper.getDOMNode()).toExist();
						expect(scratch.innerHTML).toBe('<div></div>');

						done();
					}}
				/>
			);

			expect(wrapper.instance().getStatus()).toEqual(UNMOUNTED);
			// expect(wrapper.getDOMNode()).not.toExist();
			expect(scratch.innerHTML).toBe('');

			wrapper.setState({ in: true });
		});

		it('should unmount after exiting', done => {
			const wrapper = mount(
				<UnmountTransition
					initialIn
					onExited={() => {
						setTimeout(() => {
							expect(wrapper.instance().getStatus()).toEqual(UNMOUNTED);
							// expect(wrapper.getDOMNode()).not.toExist();
							expect(scratch.innerHTML).toBe('');
							done();
						});
					}}
				/>
			);

			expect(wrapper.instance().getStatus()).toEqual(ENTERED);
			// expect(wrapper.getDOMNode()).toExist();
			expect(scratch.innerHTML).toBe('<div></div>');

			wrapper.setState({ in: false });
		});
	});
});
