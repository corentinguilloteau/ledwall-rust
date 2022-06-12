import { Button } from "@mantine/core";
import { dialog, fs } from "@tauri-apps/api";
import { Dispatch } from "react";
import { useDispatch } from "react-redux";
import { Folder, HandStop } from "tabler-icons-react";
import { loadSlabs } from "../../../data/store/slicesSlice";
import Slice from "../../../data/types/Slice";
import useRPC from "../../../hooks/useRPC";

async function loadConfig(dispatchFunction: Dispatch<any>) {
	let path = await dialog.open({
		title: "Ouvrir une configuration",
		filters: [{ name: "Fichier ledwall", extensions: ["lwc"] }],
		multiple: false,
		directory: false,
	});

	if (Array.isArray(path)) {
		throw Error("Cannot load multiple path");
	}

	let serializedConfig = await fs.readTextFile(path);

	let config: Slice[] = JSON.parse(serializedConfig);

	console.log(config);

	dispatchFunction(loadSlabs(config));
}

export default function LoadButton() {
	let [loadStatus, , , loadCommand] = useRPC(loadConfig, true);
	const dispatch = useDispatch();

	return (
		<Button
			onClick={() => {
				loadCommand(dispatch);
			}}
			loading={loadStatus === "loading"}
			leftIcon={loadStatus === "error" ? <HandStop /> : null}>
			<Folder />
		</Button>
	);
}
