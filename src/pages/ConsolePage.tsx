import { Group, Paper, Title, Text, ScrollArea, Grid, Space } from "@mantine/core";
import { maxHeight } from "@mui/system";
import React from "react";
import Page from "./Page";

class ConsolePage extends React.Component {
	render() {
		return (
			<Page title="Console">
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
					<Text>
						aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
					</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					{/* <Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text>
					<Text>Test</Text> */}
				</Paper>
			</Page>
		);
	}
}

export default ConsolePage;
