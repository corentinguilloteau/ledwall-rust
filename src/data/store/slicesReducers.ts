import { Draft, PayloadAction } from "@reduxjs/toolkit";
import { defaultSlice, SlabPayload, SlicePayload, SlicesState } from "../types/Slice";

function identifiersSanityCheck(id: number): boolean {
	return Number.isInteger(id) && id >= 0;
}

export function addSliceReducer(state: Draft<SlicesState>) {
	state.slices.push(defaultSlice);
}

export function setSliceSpoutNameReducer(
	state: Draft<SlicesState>,
	action: PayloadAction<SlicePayload<string | null>>
) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].spoutName = action.payload.payload;
		}
	}
}

export function removeSliceReducer(state: Draft<SlicesState>, action: PayloadAction<number>) {
	let sliceId = action.payload;

	if (identifiersSanityCheck(sliceId)) {
		if (state.slices.length > sliceId) {
			state.slices.splice(sliceId, 1);
		}
	}
}

export function setSliceWidthReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].width = action.payload.payload;

			if (state.slices[sliceId].slabs.length > 0) {
				let currentWidth = state.slices[sliceId].slabs[0].length;

				while (currentWidth > action.payload.payload && state.slices[sliceId].slabs[0].length > 0) {
					for (let line = 0; line < state.slices[sliceId].slabs.length; line++) {
						state.slices[sliceId].slabs[line].pop();
					}
					currentWidth = state.slices[sliceId].slabs[0].length;
				}

				while (currentWidth < action.payload.payload) {
					for (let line = 0; line < state.slices[sliceId].slabs.length; line++) {
						state.slices[sliceId].slabs[line].push(0);
					}
					currentWidth = state.slices[sliceId].slabs[0].length;
				}
			}
		}
	}
}

export function setSliceHeightReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].height = action.payload.payload;

			let currentHeight = state.slices[sliceId].slabs.length;

			while (currentHeight > action.payload.payload && state.slices[sliceId].slabs.length > 0) {
				state.slices[sliceId].slabs.pop();

				currentHeight = state.slices[sliceId].slabs.length;
			}

			while (currentHeight < action.payload.payload) {
				state.slices[sliceId].slabs.push(new Array(state.slices[sliceId].width).fill(0));
				currentHeight = state.slices[sliceId].slabs.length;
			}
		}
	}
}

export function setSliceSlabWidthReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].slabWidth = action.payload.payload;
		}
	}
}

export function setSliceSlabHeightReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].slabHeight = action.payload.payload;
		}
	}
}

export function setSliceColorReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<string>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].color = action.payload.payload;
		}
	}
}

export function setSlabReducer(state: Draft<SlicesState>, action: PayloadAction<SlabPayload<number>>) {
	let sliceId = action.payload.sliceID;
	let [slabX, slabY] = action.payload.slabCoordinate;

	if (!identifiersSanityCheck(slabX) || !identifiersSanityCheck(slabY)) {
		return;
	}

	if (identifiersSanityCheck(sliceId)) {
		if (state.slices.length > sliceId) {
			let slice = state.slices[sliceId];

			if (slice.height > slabY && slice.width > slabX) {
				if (identifiersSanityCheck(action.payload.payload)) {
					state.slices[sliceId].slabs[slabY][slabX] = action.payload.payload;
				}
			}
		}
	}
}
