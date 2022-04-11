import { Grid } from "@mantine/core";
import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import { LedwallControlHolder, LedwallControlStatus, LedwallControlTests } from "../../data/types/LedwallControlTypes";
import useRemoteState from "../../hooks/useRemoteState";
import useRPC from "../../hooks/useRPC";
import Page from "../Page";
import ControlPageButtons from "./ControlPageButtons";
import ControlPageIcon from "./ControlPageIcon";

function ControlPage() {
	let [status] = useRemoteState<LedwallControlHolder>("status");

	function onTestClick(testType: LedwallControlTests) {}

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
					{status === null ? null : <ControlPageIcon status={status.status} />}
				</Grid.Col>
				<Grid.Col style={{ flex: "1 1 auto", display: "flex", alignItems: "center" }}>
					{status === null ? null : <ControlPageButtons status={status} onTestClick={onTestClick} />}
				</Grid.Col>
			</Grid>
		</Page>
	);
}

export default ControlPage;
