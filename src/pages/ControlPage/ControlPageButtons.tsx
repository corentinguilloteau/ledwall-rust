import { Button, Group, Select } from "@mantine/core";
import { useState } from "react";
import {
	isTestType,
	LedwallControlHolder,
	LedwallControlStatus,
	LedwallControlTests,
	LedwallControlTestsEnum,
} from "../../data/types/LedwallControlTypes";

type OnOff = "on" | "off";

interface ControlPageButtonsProps {
	status: LedwallControlHolder;
	onStartClick: () => void;
	onStopClick: () => void;
	onTestClick: (testType: LedwallControlTests) => void;
}

function getState(holder: LedwallControlHolder): [OnOff, boolean, boolean] {
	let startStopButton: OnOff = "on";
	let startStopButtonEnabled = false;
	let testButtonEnabled = false;

	switch (holder.status) {
		case "display":
			startStopButton = "off";
			startStopButtonEnabled = true;
			testButtonEnabled = false;
			break;
		case "stop":
			startStopButton = "on";
			startStopButtonEnabled = true;
			testButtonEnabled = true;
			break;
		// case LedwallControlStatus.Testing:
		// 	startStopButton = "on";
		// 	startStopButtonEnabled = true;
		// 	testButtonEnabled = true;
		// 	currentTest = holder.test;
		// 	break;
	}

	return [startStopButton, startStopButtonEnabled, testButtonEnabled];
}

let OnOffButtonText: { [key in OnOff]: string } = {
	on: "Diffuser le flux",
	off: "Arrêter la diffusion",
};

let OnOffButtonColor: { [key in OnOff]: string } = {
	on: "green",
	off: "red",
};

let TestSelectText: { [key in LedwallControlTests]: string } = {
	number: "Identifiants de dalles",
	version: "Version des dalles",
	// [LedwallControlTests.Color]: "Afficher les couleurs de test",
};

interface TestChoice {
	value: string;
	label: string;
}

function getListOfTestChoices(): TestChoice[] {
	let res: TestChoice[] = [];

	for (const [key, value] of Object.entries(TestSelectText)) {
		res.push({ value: key, label: value });
	}

	return res;
}

function ControlPageButtons(props: ControlPageButtonsProps) {
	let [startStopButton, startStopButtonEnabled, testButtonEnabled] = getState(props.status);

	let [currentTest, setCurrentTest] = useState("number" as LedwallControlTests);

	let OnOffButtonClick: { [key in OnOff]: () => void } = {
		on: props.onStartClick,
		off: props.onStopClick,
	};

	return (
		<Group grow style={{ flex: 1, justifyContent: "space-evenly" }}>
			<div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
				<Button
					style={{ flex: "0 0 auto" }}
					color={OnOffButtonColor[startStopButton]}
					disabled={!startStopButtonEnabled}
					onClick={OnOffButtonClick[startStopButton]}>
					{OnOffButtonText[startStopButton]}
				</Button>
			</div>
			<Group grow style={{ flex: 1, justifyContent: "space-evenly", flexDirection: "column" }}>
				<Select
					value={currentTest}
					onChange={(value) => {
						if (value !== null) {
							if (isTestType(value)) {
								setCurrentTest(value);
							}
						}
					}}
					placeholder="Choisir un test"
					data={getListOfTestChoices()}
					disabled={!testButtonEnabled}
				/>
				<div style={{ flex: 1, display: "flex", justifyContent: "space-evenly" }}>
					<Button
						style={{ flex: "1 1 auto" }}
						color="yellow"
						disabled={!testButtonEnabled}
						onClick={() => {
							props.onTestClick(currentTest);
						}}>
						Envoyer la commande
					</Button>
				</div>
			</Group>
		</Group>
	);
}

export default ControlPageButtons;
