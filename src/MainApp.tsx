import { AppShell, Badge, Box, Button, Grid, Group, SimpleGrid } from "@mantine/core";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import ConfigPage from "./pages/ConfigPage";
import ConsolePage from "./pages/ConsolePage";
import ControlPage from "./pages/ControlPage";
import GuidePage from "./pages/GuidePage";

class MainApp extends React.Component {
	render() {
		return (
			<Grid columns={1} gutter={0} style={{ flexWrap: "nowrap", flexDirection: "column", height: "100vh" }} m={0}>
				<Grid.Col
					style={{
						flex: "1",
						overflow: "auto",
						display: "flex",
					}}>
					{/* <Grid m={0} style={{ minHeight: 0, flex: 1 }}>
						<Grid.Col style={{ flex: "0 1  0" }}>
							<Navbar />
						</Grid.Col>
						<Grid.Col style={{ display: "flex", flex: "1", overflow: "auto" }}>
							<Box style={{ minHeight: 0 }}>
								<Routes>
									<Route path="/guide" element={<GuidePage />}></Route>
									<Route path="/control" element={<ControlPage />}></Route>
									<Route path="/config" element={<ConfigPage />}></Route>
									<Route path="/console" element={<ConsolePage />}></Route>
									<Route path="*" element={<GuidePage />}></Route>
								</Routes>
							</Box>
						</Grid.Col>
					</Grid> */}

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
								backgroundColor:
									theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
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
					<Footer></Footer>
				</Grid.Col>
			</Grid>
		);
	}
}

export default MainApp;
