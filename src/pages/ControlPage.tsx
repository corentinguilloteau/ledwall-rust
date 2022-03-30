import { ActionIcon, Button, Grid, Group, Tooltip, useMantineTheme } from "@mantine/core";
import React from "react";
import { PlayerPlay, PlayerStop, TestPipe } from "tabler-icons-react";
import Page from "./Page";

function ControlPage() {
	let theme = useMantineTheme();

	return (
		<Page title="Commandes">
			<Grid
				style={{
					flex: "1",
					display: "flex",
					flexDirection: "column",
					flexWrap: "nowrap",
					overflow: "auto",
				}}>
				<Grid.Col
					style={{
						flex: "1 1 auto",
						display: "flex",
						overflow: "hidden",
						alignItems: "center",
						justifyContent: "center",
					}}>
					<PlayerStop
						style={{
							height: "200px",
							width: "auto",
							border: `3px solid ${theme.colors.red[6]}`,
							borderRadius: theme.radius.xl,
							stroke: theme.colors.red[6],
							fill: theme.colors.red[6],
						}}
					/>
					<PlayerPlay
						style={{
							height: "200px",
							width: "auto",
							border: `3px solid ${theme.colors.green[6]}`,
							borderRadius: theme.radius.xl,
							stroke: theme.colors.green[6],
							fill: theme.colors.green[6],
						}}
					/>
					<TestPipe
						style={{
							height: "200px",
							width: "auto",
							border: `3px solid ${theme.colors.yellow[6]}`,
							borderRadius: theme.radius.xl,
							stroke: theme.colors.yellow[6],
						}}
					/>
				</Grid.Col>
				<Grid.Col style={{ flex: "1 1 auto", display: "flex", alignItems: "center" }}>
					<Group grow style={{ flex: 1, justifyContent: "space-evenly" }}>
						<Button style={{ flex: "0 0 auto" }} color="green">
							Diffuser le flux
						</Button>
						<Button style={{ flex: "0 0 auto" }} color="yellow">
							Tester la diffusion
						</Button>
					</Group>
				</Grid.Col>
			</Grid>
		</Page>
	);
}

export default ControlPage;
