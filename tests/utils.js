import { h, Component, render, options } from 'preact';

/**
 * Setup the test environment
 * @returns {HTMLDivElement}
 */
export function setupScratch() {
	const scratch = document.createElement('div');
	(document.body || document.documentElement).appendChild(scratch);
	return scratch;
}

let prevDebounce = null;

export function setupRerenderAll() {
	prevDebounce = options.debounceRendering;

	let rerenders = [];
	options.debounceRendering = (rerender) => {
		rerenders.push(rerender);
	};

	return () => {
		let rerender;
		tryClockTick();

		// Call rerender in a loop to catch rerenders that trigger
		// more rerenders
		while (rerender = rerenders.shift()) {
			rerender();
			tryClockTick();
		}
	};
}

function tryClockTick(ms = 10) {
	try {
		jasmine.clock().tick(ms);
	}
	catch (e) {
		// Jasmine will throw an error if the mock clock
		// isn't installed. That's okay. Ignore it.
	}
}

/**
 * Teardown test environment and reset preact's internal state
 * @param {HTMLDivElement} scratch
 */
export function teardown(scratch) {
	scratch.parentNode.removeChild(scratch);
	if (prevDebounce) {
		options.debounceRendering = prevDebounce;
		prevDebounce = null;
	}
}

export function setupCustomMatchers() {
	jasmine.addMatchers({
		toExist: () => ({
			compare: actual => ({
				pass: actual != null
			})
		}),
		toHaveLength: () => ({
			compare(actualArray, expectedLength) {
				if (!actualArray || typeof actualArray.length !== 'number') {
					throw new Error(
						'[.not].toHaveLength expected actual value to have a ' +
							'"length" property that is a number. Recieved: ' +
							actualArray
					);
				}

				const actualLength = actualArray.length;
				const pass = actualArray.length === expectedLength;

				const message = !pass
					? // Error message for `.toHaveLength` case
					  `Expected actual value to have length ${expectedLength} but got ${actualLength}`
					: // Error message for `.not.toHaveLength` case
					  `Expected actual value to not have length ${expectedLength} but got ${actualLength}`;

				return { pass, message };
			}
		})
	});
}

class MountWrapper extends Component {
	constructor(...args) {
		super(...args);
		const { props, context } = this.props;
		this.state = {
			mount: true,
			props,
			context
		};
	}

	/**
	 * @returns {import('preact').Component}
	 */
	getInstance() {
		return this._instance;
	}

	getChildProps() {
		return this.getInstance().props;
	}

	getChildState() {
		return this.getInstance().state;
	}

	getChildContext() {
		return this.state.context;
	}

	getChildDomNode() {
		return this.getInstance().base;
	}

	setInstance(c) {
		this._instance = c;
	}

	setChildProps(newProps, callback = undefined) {
		const { props: oldProps } = this.state;
		const props = { ...oldProps, ...newProps };
		this.setState({ props }, callback);
	}

	setChildState(newState, callback) {
		this.getInstance().setState(newState, callback);
	}

	setChildContext(newContext, callback) {
		const { context: oldContext } = this.state;
		const context = { ...oldContext, ...newContext };
		this.setState({ context }, callback);
	}

	render() {
		const { Component } = this.props;
		const { mount, props } = this.state;
		if (!mount) return null;
		return <Component ref={c => this.setInstance(c)} {...props} />;
	}
}

/**
 * Create a `mount` function that mimics Enzyme's API
 * @param {HTMLElement} scratch The element to render into
 */
export function createMount(scratch) {
	// TODO: Investigate more closely matching enzyme's functionality
	// of having mount manage scratch internally...
	// https://git.io/fANvl
	// Perhaps use a global jasmine beforeEach, afterEach?

	/**
	 * @param {import('preact').VNode} vnode
	 * @param {*} [context]
	 */
	function mount(vnode, context) {
		const wrapperProps = {
			Component: vnode.nodeName,
			props: { ...vnode.attributes, children: vnode.children },
			context
		};

		/** @type {MountWrapper} */
		let wrapper;

		render(
			<MountWrapper {...wrapperProps} ref={c => (wrapper = c)} />,
			scratch
		);

		const preactWrapper = {

			/** Get the mounted component's state */
			state(field) {
				return field ? wrapper.getChildState()[field] : wrapper.getChildState();
			},

			/** Set the mounted component's props */
			setProps(newProps, callback) {
				return wrapper.setChildProps(newProps, callback);
			},

			/** Get the mounted component's instance */
			instance() {
				return wrapper.getInstance();
			},

			/** Get the mounted component's DOM node */
			getDOMNode() {
				return wrapper.getChildDomNode();
			},

			/** Set the mounted component's state */
			setState(newState, callback) {
				return wrapper.setChildState(newState, callback);
			},

			tap(callback) {
				callback(preactWrapper);
				return preactWrapper;
			}
		};

		return preactWrapper;
	}

	return mount;
}
