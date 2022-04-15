import { createSlice } from "@reduxjs/toolkit";
import { SlicesState } from "../types/Slice";
import * as reducers from "./slicesReducers";

const initialState: SlicesState = {
	slices: [],
};

export const slicesSlice = createSlice({
	name: "slices",
	initialState,
	reducers: {
		addSlice: reducers.addSliceReducer,
		removeSlice: reducers.removeSliceReducer,
		setSliceSpoutName: reducers.setSliceSpoutNameReducer,
		setSliceWidth: reducers.setSliceWidthReducer,
		setSliceHeight: reducers.setSliceHeightReducer,
		setSliceSlabWidth: reducers.setSliceSlabWidthReducer,
		setSliceSlabHeight: reducers.setSliceSlabHeightReducer,
		setSliceColor: reducers.setSliceColorReducer,
		setSlab: reducers.setSlabReducer,
		loadSlabs: reducers.loadSlabsReducer,
	},
});

// Action creators are generated for each case reducer function
export const {
	addSlice,
	removeSlice,
	setSliceSpoutName,
	setSliceWidth,
	setSliceHeight,
	setSliceSlabWidth,
	setSliceSlabHeight,
	setSliceColor,
	setSlab,
	loadSlabs,
} = slicesSlice.actions;

export default slicesSlice.reducer;
