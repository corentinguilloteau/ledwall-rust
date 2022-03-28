import { Grid, Space, Title } from "@mantine/core";
import React, { Component } from "react";

type PageProps = {
	title: string;
};

export default class Page extends Component<PageProps> {
	render() {
		return (
			<Grid
				sx={(theme) => ({
					flexDirection: "column",
					flexWrap: "nowrap",
					overflow: "auto",
					flex: 1,
					color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
				})}
				m="0">
				<Title order={1}>{this.props.title}</Title>
				<Space h="md"></Space>
				<Grid.Col style={{ flex: "1", display: "flex", overflow: "auto" }}>{this.props.children}</Grid.Col>
			</Grid>
		);
	}
}
