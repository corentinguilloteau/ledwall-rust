import { Button, Grid } from "@mantine/core";
import React, { Component } from "react";

export class SliceConfiguration extends Component {
	render() {
		return (
			<Grid
				sx={(theme) => ({
					flex: "1",
				})}
				m={0}>
				<Grid.Col style={{ flex: "1" }}>aaa</Grid.Col>
				<Grid.Col style={{ flex: "0 1 auto" }}>
					<Button>dddd</Button>
				</Grid.Col>
			</Grid>
		);
	}
}
