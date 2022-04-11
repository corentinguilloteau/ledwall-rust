import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";
import useRPC, { RPCStatus } from "./useRPC";

export default function useRemoteState<T>(key: string): [T | null, RPCStatus] {
	let [state, setState] = useState(null as T | null);

	let [stateStatus, , , handledCall] = useRPC<T>(invoke, "fetch_status");

	useEffect(() => {
		handledCall()
			.then((res) => {
				if (res !== undefined) {
					setState(res);
				}
			})
			.catch((err) => {
				console.log(err);
			});

		let unsub = listen("backend-data-update", (event) => {
			if (event.payload === key) {
				handledCall()
					.then((res) => {
						if (res !== undefined) {
							setState(res);
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
		});

		return () => {
			unsub.then((fn) => {
				fn();
			});
		};
	}, []);

	return [state, stateStatus];
}
