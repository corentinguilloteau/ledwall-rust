import { AppShell, Badge, Box, Button, Grid, Group, SimpleGrid } from "@mantine/core";
import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/NavBar/Navbar";
import { NotificationPayload } from "./data/types/Notification";
import { useReceiveRemoteData } from "./hooks/useRemoteState";
import ConfigPage from "./pages/ConfigPage/ConfigPage";
import ConsolePage from "./pages/ConsolePage/ConsolePage";
import ControlPage from "./pages/ControlPage/ControlPage";
import GuidePage from "./pages/GuidePage/GuidePage";

function MainApp() {
	let [fpsCount, setFpsCount] = useState(0);

	useReceiveRemoteData("backend-notification", (p) => {
		let payload = p as NotificationPayload;
		payload.timestamp = new Date();

		if (payload.kind === "status" && payload.title === "fps") {
			setFpsCount(parseInt(payload.message));
		}
	});

	return (
		<Grid columns={1} gutter={0} style={{ flexWrap: "nowrap", flexDirection: "column", height: "100vh" }} m={0}>
			<Grid.Col
				style={{
					flex: "1",
					overflow: "auto",
					display: "flex",
				}}>
				<AppShell
					padding="xl"
					navbar={<Navbar />}
					styles={(theme) => ({
						root: {
							flex: 1,
							display: "flex",
							overflow: "auto",
						},
						body: {
							flex: 1,
							display: "flex",
							overflow: "auto",
						},
						main: {
							backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
							boxSizing: "border-box",
							flex: 1,
							display: "flex",
							overflow: "auto",
							width: "auto",
						},
					})}>
					<Routes>
						<Route path="/guide" element={<GuidePage />}></Route>
						<Route path="/control" element={<ControlPage />}></Route>
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
				<Footer fps={fpsCount}></Footer>
			</Grid.Col>
		</Grid>
	);
}

export default MainApp;
