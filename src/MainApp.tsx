import { AppShell, Badge, Button, Grid, Group, SimpleGrid } from "@mantine/core";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./Navbar";
import ConfigPage from "./pages/ConfigPage";
import ConsolePage from "./pages/ConsolePage";
import GuidePage from "./pages/GuidePage";

class MainApp extends React.Component {
	render() {
		return (
			<Grid columns={1} gutter={0} style={{ flexDirection: "column", height: "100vh" }}>
				<Grid.Col
					style={{
						flex: "1 0 auto",
					}}>
					<AppShell
						padding="md"
						navbar={<Navbar />}
						styles={(theme) => ({
							main: {
								backgroundColor:
									theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
							},
							body: {
								height: "100%",
							},
						})}
						style={{
							height: "100%",
						}}>
						<Routes>
							<Route path="/guide" element={<GuidePage />}></Route>
							<Route path="/control" element={<ConsolePage />}></Route>
							<Route path="/config" element={<ConfigPage />}></Route>
							<Route path="/console" element={<ConsolePage />}></Route>
							<Route path="*" element={<GuidePage />}></Route>
						</Routes>
					</AppShell>
				</Grid.Col>
				<Grid.Col
					style={{
						flex: "0 1 auto",
						flexBasis: 0,
					}}>
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
				</Grid.Col>
			</Grid>
		);
	}
}

export default MainApp;
