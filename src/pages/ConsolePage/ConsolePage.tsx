import { Group, Paper, Title, Text, ScrollArea, Grid, Space } from "@mantine/core";
import { maxHeight } from "@mui/system";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../data/store/store";
import { NotificationPayload } from "../../data/types/Notification";
import Page from "../Page";

function getTextForNotification(notification: NotificationPayload) {
	let dateString = "";

	if (notification.timestamp) {
		let t = notification.timestamp;

		dateString =
			("0" + t.getUTCDate()).slice(-2) +
			"/" +
			("0" + (t.getUTCMonth() + 1)).slice(-2) +
			"/" +
			t.getUTCFullYear() +
			" " +
			("0" + t.getUTCHours()).slice(-2) +
			":" +
			("0" + t.getUTCMinutes()).slice(-2) +
			":" +
			("0" + t.getUTCSeconds()).slice(-2);
	}

	let color;

	switch (notification.kind) {
		case "info":
			color = "blue";
			break;
		case "success":
			color = "teal";
			break;
		case "warning":
			color = "orange";
			break;
		case "error":
			color = "red";
			break;
	}

	return (
		<Text color={color}>
			[{dateString}] [{notification.origin}] {notification.message}
		</Text>
	);
}

export default function ConsolePage() {
	let notifications = useSelector((state: RootState) => state.notifications.notifications);

	const viewport = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement> | undefined;

	const scrollToBottom = () => viewport?.current.scrollTo({ top: viewport.current.scrollHeight, behavior: "smooth" });

	useEffect(() => {
		scrollToBottom();
	});

	return (
		<Page title="Console">
			<ScrollArea
				viewportRef={viewport}
				p="md"
				type="auto"
				style={{ flex: "1" }}
				sx={(theme) => ({
					border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]}`,
					borderRadius: `${theme.radius["md"]}px`,
				})}>
				{notifications.map((n) => {
					return getTextForNotification(n);
				})}
			</ScrollArea>
		</Page>
	);
}
