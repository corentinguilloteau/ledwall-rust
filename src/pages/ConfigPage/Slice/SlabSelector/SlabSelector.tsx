import { Container, NumberInput } from "@mantine/core";
import React, { Component } from "react";

export class SlabSelector extends Component {
	render() {
		return (
			<Container
				sx={(theme) => ({
					display: "flex",
					flex: 1,
					alignItems: "center",
					alignContent: "center",
					borderRight: `solid 1px ${
						theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[5]
					}`,
					justifyContent: "center",
					"&:last-child": {
						borderRight: "none",
					},
				})}
				p="xl">
				<NumberInput defaultValue={18} placeholder="18" styles={{ wrapper: { width: "100px" } }} min={0} />
			</Container>
		);
	}
}
