import { Badge, Group } from "@mantine/core";
import React from "react";

interface FooterProps {
	fps: number;
}

function Footer(props: FooterProps) {
	return (
		<Group
			sx={(theme) => ({
				padding: theme.spacing.xs,
				borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]}`,
				color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
				backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
			})}
			position="right">
			<Badge size="md" color="green" variant="filled">
				Running
			</Badge>
			<Badge size="md" color="green" variant="outline">
				{props.fps} fps
			</Badge>
		</Group>
	);
}

export default Footer;
