import { Button } from "@mantine/core";
import React from "react";
import { DeviceFloppy, HandStop } from "tabler-icons-react";
import { dialog, fs } from "@tauri-apps/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../data/store/store";
import useRPC from "../../../hooks/useRPC";
import Slice from "../../../data/types/Slice";

async function saveConfig(config: Slice[]) {
	let path = await dialog.save({
		title: "Enregistrer la configuration",
		filters: [{ name: "Fichier ledwall", extensions: ["lwc"] }],
	});

	let serializedConfig = JSON.stringify(config);

	await fs.writeFile({ contents: serializedConfig, path: path });
}

export default function SaveButton() {
	const slices = useSelector((state: RootState) => state.slices.slices);

	let [saveStatus, , , saveCommand] = useRPC(saveConfig, true);

	return (
		<Button
			onClick={() => {
				saveCommand(slices);
			}}
			loading={saveStatus === "loading"}
			leftIcon={saveStatus === "error" ? <HandStop /> : null}>
			<DeviceFloppy />
		</Button>
	);
}
