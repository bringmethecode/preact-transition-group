namespace jasmine {
	interface Matchers {
		toExist(): boolean;
	}
	interface ArrayLikeMatchers {
		toHaveLength(expectedLength: number): boolean;
	}
}
