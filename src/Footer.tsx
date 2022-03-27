import { Badge, Group } from "@mantine/core";
import React from "react";

class Footer extends React.Component {
	render() {
		return (
			<Group
				sx={(theme) => ({
					padding: theme.spacing.xs,
					borderTop: `1px solid ${
						theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
					}`,
					color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
					backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
				})}
				position="right">
				<Badge size="md" color="green" variant="filled">
					Running
				</Badge>
				<Badge size="md" color="green" variant="outline">
					15 fps
				</Badge>
			</Group>
		);
	}
}

export default Footer;
