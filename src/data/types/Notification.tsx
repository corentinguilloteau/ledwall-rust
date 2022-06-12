import { MantineTheme } from "@mantine/core";
import { Check, ExclamationMark, InfoCircle, X } from "tabler-icons-react";

export interface NotificationPayload {
	title: string;
	message: string;
	kind: string;
	consoleOnly: boolean;
	origin: string;
	timestamp?: Date;
}

export interface NotificationsState {
	notifications: NotificationPayload[];
}

export function generateNotification(payload: NotificationPayload) {
	let notification = {
		title: `${payload.title}`,
		message: payload.message,
		color: "",
		icon: <InfoCircle size={18} />,
		styles: (theme: MantineTheme) => ({
			root: {
				backgroundColor: theme.colors.dark[5],
				borderColor: theme.colors.dark[5],
				color: theme.colors.gray[1],
			},
			title: { color: theme.colors.gray[1] },
			description: { color: theme.colors.gray[1] },
		}),
	};

	switch (payload.kind) {
		case "info":
			notification.color = "blue";
			notification.icon = <InfoCircle size={18} />;
			break;
		case "success":
			notification.color = "teal";
			notification.icon = <Check size={18} />;

			break;
		case "warning":
			notification.color = "orange";
			notification.icon = <ExclamationMark size={18} />;

			break;
		case "error":
			notification.color = "red";
			notification.icon = <X size={18} />;

			break;
	}

	return notification;
}

export function generateNotificationFromError() {}
