interface Slice {
	width: number;
	height: number;
	slabHeight: number;
	slabWidth: number;
	color: string;
	slabs: number[][];
}

export interface SlicesState {
	slices: Slice[];
}

export interface SlicePayload<T> {
	sliceID: number;
	payload: T;
}

export interface SlabPayload<T> {
	sliceID: number;
	slabCoordinate: [number, number];
	payload: T;
}

export const defaultSlice = {
	width: 3,
	height: 2,
	slabHeight: 18,
	slabWidth: 18,
	color: "#FFFFFF",
	slabs: [
		[-1, -1, -1],
		[-1, -1, -1],
	],
};

export default Slice;
