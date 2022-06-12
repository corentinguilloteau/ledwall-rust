import { Draft, PayloadAction } from "@reduxjs/toolkit";
import { NotificationPayload, NotificationsState } from "../types/Notification";

export function addNotificationReducer(state: Draft<NotificationsState>, action: PayloadAction<NotificationPayload>) {
	state.notifications.push(action.payload);
}
