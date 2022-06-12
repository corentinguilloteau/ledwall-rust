import { createSlice } from "@reduxjs/toolkit";
import { NotificationsState } from "../types/Notification";
import * as reducers from "./notificationsReducers";

const initialState: NotificationsState = {
	notifications: [],
};

export const notificationsSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {
		addNotification: reducers.addNotificationReducer,
	},
});

// Action creators are generated for each case reducer function
export const { addNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;
