import { idText } from "typescript";

interface Slice {
	id: number;
	spoutName: string | null;
	width: number;
	height: number;
	slabHeight: number;
	slabWidth: number;
	color: string;
	slabs: number[][];
	errors: String[];
}

class SliceControlErrors {
	static NoSpoutName(sliceID: number) {
		return `Pas de Spout sélectionné pour la slice ${sliceID}.`;
	}
}

export function computeSliceControl(slice: Slice, sliceId: number) {
	let errors = [];

	console.log(slice.spoutName);

	if (slice.spoutName === null) {
		errors.push(SliceControlErrors.NoSpoutName(sliceId));
	}

	console.log(errors);

	return errors;
}

export function computeSlabErrors(slices: Slice[], slabId: number) {
	if (slabId === 0) {
		return [];
	}

	let conflictingSlices = slices
		.map((slice) => {
			return {
				contains: slice.slabs.flatMap((row) => row.map((slab) => slab === slabId)).filter((v) => v === true)
					.length,
				id: slice.id,
			};
		})
		.filter((slice) => slice.contains >= 1);

	if (conflictingSlices.length === 1 && conflictingSlices[0].contains === 1) return [];

	return conflictingSlices.map((elem) => elem.id);
}

export function configHasErrors(errors: SlicesErrors) {
	return (
		Object.values(errors.slabErrors)
			.map((slab) => slab.length)
			.reduce((p, c) => p + c) +
		Object.values(errors.sliceErrors)
			.map((slice) => slice.length)
			.reduce((p, c) => p + c)
	);
}

export interface SlicesErrors {
	slabErrors: { [id: number]: number[] };
	sliceErrors: { [id: number]: String[] };
}

export interface SlicesState {
	slices: Slice[];
	errors: SlicesErrors;
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

export function defaultSlice(id: number) {
	return {
		id: id,
		spoutName: null,
		width: 3,
		height: 2,
		slabHeight: 18,
		slabWidth: 18,
		color: "#FFFFFF",
		slabs: [
			[0, 0, 0],
			[0, 0, 0],
		],
		errors: [],
	};
}

export default Slice;
