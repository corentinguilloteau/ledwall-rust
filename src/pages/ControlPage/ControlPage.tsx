import { Grid } from "@mantine/core";
import { useState } from "react";
import { LedwallControlHolder, LedwallControlStatus, LedwallControlTests } from "../../data/types/LedwallControlTypes";
import Page from "../Page";
import ControlPageButtons from "./ControlPageButtons";
import ControlPageIcon from "./ControlPageIcon";

function ControlPage() {
	let initialStatus: LedwallControlHolder = {
		status: "stop",
	};

	let [status, setStatus] = useState(initialStatus as LedwallControlHolder);

	function onStartClick() {
		setStatus((value) => ({ status: "display" }));
	}

	function onStopClick() {
		setStatus((value) => ({ status: "stop" }));
	}

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
					<ControlPageIcon status={status.status} />
				</Grid.Col>
				<Grid.Col style={{ flex: "1 1 auto", display: "flex", alignItems: "center" }}>
					<ControlPageButtons
						status={status}
						onStartClick={onStartClick}
						onStopClick={onStopClick}
						onTestClick={onTestClick}
					/>
				</Grid.Col>
			</Grid>
		</Page>
	);
}

export default ControlPage;
