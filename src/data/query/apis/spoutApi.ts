import { SpoutName } from "../../types/Spout";
import { invoke } from "@tauri-apps/api/tauri";

export async function fetchSpoutNames(): Promise<SpoutName[]> {
	return invoke("fetchSpoutNames");
}
