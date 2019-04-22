namespace jasmine {
	interface Matchers {
		toExist(): boolean;
		toHaveLength(expectedLength: number): boolean;
	}
	interface ArrayLikeMatchers {
		toHaveLength(expectedLength: number): boolean;
	}
}
