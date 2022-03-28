import { Group, Paper, Title, Text, ScrollArea, Grid, Space } from "@mantine/core";
import { maxHeight } from "@mui/system";
import React from "react";

class ConsolePage extends React.Component {
	render() {
		return (
			<Grid
				sx={(theme) => ({
					flexDirection: "column",
					flexWrap: "nowrap",
					flex: 1,
					color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
				})}
				m="0">
				<Title order={1}>Console</Title>
				<Space h="md"></Space>
				<Paper shadow="xs" p="md" component={ScrollArea} type="auto">
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
			</Grid>
		);
	}
}

export default ConsolePage;
