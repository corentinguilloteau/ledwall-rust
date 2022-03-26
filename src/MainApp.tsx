import { AppShell } from "@mantine/core";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./Navbar";
import ConfigPage from "./pages/ConfigPage";
import ConsolePage from "./pages/ConsolePage";
import GuidePage from "./pages/GuidePage";

class MainApp extends React.Component {
	render() {
		return (
			<AppShell
				padding="md"
				navbar={<Navbar />}
				styles={(theme) => ({
					main: {
						backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
					},
				})}>
				<Routes>
					<Route path="/guide" element={<GuidePage />}></Route>
					<Route path="/config" element={<ConfigPage />}></Route>
					<Route path="/console" element={<ConsolePage />}></Route>
					<Route path="*" element={<GuidePage />}></Route>
				</Routes>
			</AppShell>
		);
	}
}

export default MainApp;
