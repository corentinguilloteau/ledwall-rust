import { Paper, ScrollArea, Text } from "@mantine/core";
import React from "react";
import Page from "../Page";

class GuidePage extends React.Component {
	render() {
		return (
			<Page title="Guide">
				<Paper
					shadow="xs"
					p="md"
					component={ScrollArea}
					type="auto"
					style={{ flex: "1" }}
					sx={(theme) => ({
						border: `1px solid ${
							theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
						}`,
						borderRadius: `${theme.radius["md"]}px`,
					})}>
					<Text>Guide </Text>
				</Paper>
			</Page>
		);
	}
}

export default GuidePage;
