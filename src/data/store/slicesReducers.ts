import { Draft, PayloadAction } from "@reduxjs/toolkit";
import { defaultSlice, SlabPayload, SlicePayload, SlicesState } from "../types/Slice";

function identifiersSanityCheck(id: number, allowMinus1: boolean): boolean {
	return Number.isInteger(id) && (allowMinus1 ? id >= -1 : id >= 0);
}

export function addSliceReducer(state: Draft<SlicesState>) {
	state.slices.push(defaultSlice);
}

export function removeSliceReducer(state: Draft<SlicesState>, action: PayloadAction<number>) {
	let sliceId = action.payload;

	if (identifiersSanityCheck(sliceId, false)) {
		if (state.slices.length > sliceId) {
			state.slices.splice(sliceId, 1);
		}
	}
}

export function setSliceWidthReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId, false)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].width = action.payload.payload;
		}
	}
}

export function setSliceHeightReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId, false)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].height = action.payload.payload;
		}
	}
}

export function setSliceSlabWidthReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId, false)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].slabWidth = action.payload.payload;
		}
	}
}

export function setSliceSlabHeightReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<number>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId, false)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].slabHeight = action.payload.payload;
		}
	}
}

export function setSliceColorReducer(state: Draft<SlicesState>, action: PayloadAction<SlicePayload<string>>) {
	let sliceId = action.payload.sliceID;

	if (identifiersSanityCheck(sliceId, false)) {
		if (state.slices.length > sliceId) {
			state.slices[sliceId].color = action.payload.payload;
		}
	}
}

export function setSlabReducer(state: Draft<SlicesState>, action: PayloadAction<SlabPayload<number>>) {
	let sliceId = action.payload.sliceID;
	let [slabX, slabY] = action.payload.slabCoordinate;

	if (!identifiersSanityCheck(slabX, false) || !identifiersSanityCheck(slabY, false)) {
		return;
	}

	if (identifiersSanityCheck(sliceId, false)) {
		if (state.slices.length > sliceId) {
			let slice = state.slices[sliceId];

			if (slice.height > slabY && slice.width > slabX) {
				if (identifiersSanityCheck(action.payload.payload, true)) {
					state.slices[sliceId].slabs[slabY][slabX] = action.payload.payload;
				}
			}
		}
	}
}
