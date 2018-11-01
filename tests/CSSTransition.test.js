import { h } from 'preact';
import { setupScratch, createMount, teardown } from './utils';
import CSSTransition from '../src/CSSTransition';

describe('CSSTransition', () => {

	/** @type {HTMLDivElement} */
	let scratch;

	/** @type {ReturnType<typeof import('./utils').createMount>} */
	let mount;

	beforeEach(() => {
		scratch = setupScratch();
		mount = createMount(scratch);
	});

	afterEach(() => {
		teardown(scratch);
	});

	it('should flush new props to the DOM before initiating a transition', done => {
		mount(
			<CSSTransition
				in={false}
				timeout={0}
				classNames="test"
				onEnter={node => {
					expect(node.classList.contains('test-class')).toEqual(true);
					expect(node.classList.contains('test-entering')).toEqual(false);
					done();
				}}
			>
				<div />
			</CSSTransition>
		)
			.tap(inst => {

				expect(inst.getDOMNode().classList.contains('test-class')).toEqual(false);
			})
			.setProps({
				in: true,
				className: 'test-class'
			});
	});

	describe('entering', () => {
		let instance;

		beforeEach(() => {
			instance = mount(
				<CSSTransition
					timeout={10}
					classNames="test"
				>
					<div />
				</CSSTransition>
			);
		});

		it('should apply classes at each transition state', done => {
			let count = 0;

			instance.setProps({
				in: true,

				onEnter(node) {
					count++;
					expect(node.className).toEqual('test-enter');
				},

				onEntering(node) {
					count++;
					expect(node.className).toEqual('test-enter test-enter-active');
				},

				onEntered(node) {
					expect(node.className).toEqual('test-enter-done');
					expect(count).toEqual(2);
					done();
				}
			});
		});

		it('should apply custom classNames names', done => {
			let count = 0;
			instance = mount(
				<CSSTransition
					timeout={10}
					classNames={{
						enter: 'custom',
						enterActive: 'custom-super-active',
						enterDone: 'custom-super-done'
					}}
				>
					<div />
				</CSSTransition>
			);

			instance.setProps({
				in: true,

				onEnter(node) {
					count++;
					expect(node.className).toEqual('custom');
				},

				onEntering(node) {
					count++;
					expect(node.className).toEqual('custom custom-super-active');
				},

				onEntered(node) {
					expect(node.className).toEqual('custom-super-done');
					expect(count).toEqual(2);
					done();
				}
			});
		});
	});

	describe('exiting', () => {
		let instance;

		beforeEach(() => {
			instance = mount(
				<CSSTransition
					in
					timeout={10}
					classNames="test"
				>
					<div />
				</CSSTransition>
			);
		});

		it('should apply classes at each transition state', done => {
			let count = 0;

			instance.setProps({
				in: false,

				onExit(node) {
					count++;
					expect(node.className).toEqual('test-exit');
				},

				onExiting(node) {
					count++;
					expect(node.className).toEqual('test-exit test-exit-active');
				},

				onExited(node) {
					expect(node.className).toEqual('test-exit-done');
					expect(count).toEqual(2);
					done();
				}
			});
		});

		it('should apply custom classNames names', done => {
			let count = 0;
			instance = mount(
				<CSSTransition
					in
					timeout={10}
					classNames={{
						exit: 'custom',
						exitActive: 'custom-super-active',
						exitDone: 'custom-super-done'
					}}
				>
					<div />
				</CSSTransition>
			);

			instance.setProps({
				in: false,

				onExit(node) {
					count++;
					expect(node.className).toEqual('custom');
				},

				onExiting(node) {
					count++;
					expect(node.className).toEqual('custom custom-super-active');
				},

				onExited(node) {
					expect(node.className).toEqual('custom-super-done');
					expect(count).toEqual(2);
					done();
				}
			});
		});
	});
});
