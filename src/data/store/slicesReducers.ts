import { current, Draft, PayloadAction } from "@reduxjs/toolkit";
import Slice, {
	computeSlabErrors,
	computeSliceControl,
	defaultSlice,
	SlabPayload,
	SlicePayload,
	SlicesState,
} from "../types/Slice";

function identifiersSanityCheck(id: number): boolean {
	return Number.isInteger(id) && id >= 0;
}

export function addSliceReducer(state: Draft<SlicesState>) {
	let id = state.slices.length === 0 ? 0 : state.slices[state.slices.length - 1].id + 1;
	let slice = defaultSlice(id);
	state.slices.push(slice);
	state.errors.sliceErrors[id] = computeSliceControl(slice, slice.id);
}

export function setSliceSpoutNameReducer(
	state: Draft<SlicesState>,
	action: PayloadAction<SlicePayload<string | null>>
) {
	let sliceIndex = action.payload.sliceID;

	if (identifiersSanityCheck(sliceIndex)) {
		if (state.slices.length > sliceIndex) {
			state.slices[sliceIndex].spoutName = action.payload.payload;
		}
	}

	state.errors.sliceErrors[state.slices[sliceIndex].id] = computeSliceControl(
		state.slices[sliceIndex],
		state.slices[sliceIndex].id
	);
}

export function removeSliceReducer(state: Draft<SlicesState>, action: PayloadAction<number>) {
	let sliceIndex = action.payload;

	if (identifiersSanityCheck(sliceIndex)) {
		if (state.slices.length > sliceIndex) {
			let removedSlice = state.slices.splice(sliceIndex, 1);
			state.errors.sliceErrors[removedSlice[0].id] = [];
		}
	}
}

export function setSliceWidthReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceIndex = action.payload.sliceID;

	if (identifiersSanityCheck(sliceIndex)) {
		if (state.slices.length > sliceIndex) {
			state.slices[sliceIndex].width = action.payload.payload;

			if (state.slices[sliceIndex].slabs.length > 0) {
				let currentWidth = state.slices[sliceIndex].slabs[0].length;

				while (currentWidth > action.payload.payload && state.slices[sliceIndex].slabs[0].length > 0) {
					for (let line = 0; line < state.slices[sliceIndex].slabs.length; line++) {
						state.slices[sliceIndex].slabs[line].pop();
					}
					currentWidth = state.slices[sliceIndex].slabs[0].length;
				}

				while (currentWidth < action.payload.payload) {
					for (let line = 0; line < state.slices[sliceIndex].slabs.length; line++) {
						state.slices[sliceIndex].slabs[line].push(0);
					}
					currentWidth = state.slices[sliceIndex].slabs[0].length;
				}
			}
		}
	}

	state.errors.sliceErrors[state.slices[sliceIndex].id] = computeSliceControl(
		state.slices[sliceIndex],
		state.slices[sliceIndex].id
	);
}

export function setSliceHeightReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceIndex = action.payload.sliceID;

	if (identifiersSanityCheck(sliceIndex)) {
		if (state.slices.length > sliceIndex) {
			state.slices[sliceIndex].height = action.payload.payload;

			let currentHeight = state.slices[sliceIndex].slabs.length;

			while (currentHeight > action.payload.payload && state.slices[sliceIndex].slabs.length > 0) {
				state.slices[sliceIndex].slabs.pop();

				currentHeight = state.slices[sliceIndex].slabs.length;
			}

			while (currentHeight < action.payload.payload) {
				state.slices[sliceIndex].slabs.push(new Array(state.slices[sliceIndex].width).fill(0));
				currentHeight = state.slices[sliceIndex].slabs.length;
			}
		}
	}

	state.errors.sliceErrors[state.slices[sliceIndex].id] = computeSliceControl(
		state.slices[sliceIndex],
		state.slices[sliceIndex].id
	);
}

export function setSliceSlabWidthReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceIndex = action.payload.sliceID;

	if (identifiersSanityCheck(sliceIndex)) {
		if (state.slices.length > sliceIndex) {
			state.slices[sliceIndex].slabWidth = action.payload.payload;
		}
	}

	state.errors.sliceErrors[state.slices[sliceIndex].id] = computeSliceControl(
		state.slices[sliceIndex],
		state.slices[sliceIndex].id
	);
}

export function setSliceSlabHeightReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceIndex = action.payload.sliceID;

	if (identifiersSanityCheck(sliceIndex)) {
		if (state.slices.length > sliceIndex) {
			state.slices[sliceIndex].slabHeight = action.payload.payload;
		}
	}

	state.errors.sliceErrors[state.slices[sliceIndex].id] = computeSliceControl(
		state.slices[sliceIndex],
		state.slices[sliceIndex].id
	);
}

export function setSliceColorReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<string>>) {
	let sliceIndex = action.payload.sliceID;

	if (identifiersSanityCheck(sliceIndex)) {
		if (state.slices.length > sliceIndex) {
			state.slices[sliceIndex].color = action.payload.payload;
		}
	}

	state.errors.sliceErrors[state.slices[sliceIndex].id] = computeSliceControl(
		state.slices[sliceIndex],
		state.slices[sliceIndex].id
	);
}

export function setSlabReducer(state: Draft<SlicesState>, action: PayloadAction<SlabPayload<number>>) {
	let sliceIndex = action.payload.sliceID;
	let [slabX, slabY] = action.payload.slabCoordinate;

	let slabId = action.payload.payload;
	let oldSlabId = 0;

	if (!identifiersSanityCheck(slabX) || !identifiersSanityCheck(slabY)) {
		return;
	}

	if (identifiersSanityCheck(sliceIndex)) {
		if (state.slices.length > sliceIndex) {
			let slice = state.slices[sliceIndex];

			if (slice.height > slabY && slice.width > slabX) {
				if (identifiersSanityCheck(slabId)) {
					oldSlabId = state.slices[sliceIndex].slabs[slabY][slabX];
					state.slices[sliceIndex].slabs[slabY][slabX] = slabId;
				}
			}
		}
	}

	state.errors.slabErrors[slabId] = computeSlabErrors(state.slices, slabId);
	state.errors.slabErrors[oldSlabId] = computeSlabErrors(state.slices, oldSlabId);
}

export function loadSlabsReducer(state: Draft<SlicesState>, action: PayloadAction<Slice[]>) {
	state.slices = action.payload;

	for (let i = 0; i < state.slices.length; i++) {
		state.errors.sliceErrors[state.slices[i].id] = computeSliceControl(state.slices[i], state.slices[i].id);
		for (let y = 0; y < state.slices[i].slabs.length; y++) {
			for (let x = 0; x < state.slices[i].slabs[y].length; x++) {
				state.errors.slabErrors[state.slices[i].slabs[y][x]] = computeSlabErrors(
					state.slices,
					state.slices[i].slabs[y][x]
				);
			}
		}
	}
}
