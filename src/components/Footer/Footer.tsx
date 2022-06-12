import { Badge, Group } from "@mantine/core";
import React from "react";
import { LedwallControlHolder } from "../../data/types/LedwallControlTypes";
import useRemoteState from "../../hooks/useRemoteState";

interface FooterProps {
	fps: number;
}

function Footer(props: FooterProps) {
	let [status] = useRemoteState<LedwallControlHolder>("status");

	let statusBadge = { color: "", text: "" };
	let fpsBadge = { color: "", displayFps: false };

	switch (status?.status) {
		case "displaying":
			fpsBadge = { color: "green", displayFps: true };
			statusBadge = { color: "green", text: "Running" };
			break;
		case "stopped":
			statusBadge = { color: "red", text: "Stopped" };
			fpsBadge = { color: "dark", displayFps: false };

			break;
	}

	return (
		<Group
			sx={(theme) => ({
				padding: theme.spacing.xs,
				borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]}`,
				color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
				backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
			})}
			position="right">
			<Badge size="md" color={statusBadge.color} variant="filled">
				{statusBadge.text}
			</Badge>
			<Badge size="md" color={fpsBadge.color} variant="outline">
				{fpsBadge.displayFps ? props.fps.toString() + "fps" : "0 fps"}
			</Badge>
		</Group>
	);
}

export default Footer;
