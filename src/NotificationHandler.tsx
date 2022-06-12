import { showNotification } from "@mantine/notifications";
import React from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "./data/store/notificationsSlice";
import { generateNotification, NotificationPayload } from "./data/types/Notification";
import { useReceiveRemoteData } from "./hooks/useRemoteState";

interface NotificationHandlerProps {
	children?: React.ReactNode;
}

export default function NotificationHandler(props: NotificationHandlerProps) {
	const dispatch = useDispatch();

	useReceiveRemoteData("backend-notification", (p) => {
		let payload = p as NotificationPayload;
		payload.timestamp = new Date();

		if (payload.consoleOnly === false) {
			let notification = generateNotification(payload);

			showNotification(notification);
		}

		dispatch(addNotification(payload));
	});
	return <>{props.children}</>;
}
