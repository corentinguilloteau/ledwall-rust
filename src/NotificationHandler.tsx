import { showNotification } from "@mantine/notifications";
import React from "react";
import { generateNotification, NotificationPayload } from "./data/types/Notification";
import { useReceiveRemoteData } from "./hooks/useRemoteState";

interface NotificationHandlerProps {
	children?: React.ReactNode;
}

export default function NotificationHandler(props: NotificationHandlerProps) {
	useReceiveRemoteData("backend-notification", (p) => {
		let payload = p as NotificationPayload;

		if (payload.consoleOnly === false) {
			let notification = generateNotification(payload);

			showNotification(notification);
		}

		// Add to console
	});
	return <>{props.children}</>;
}
