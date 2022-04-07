import { useState } from "react";

export type RPCStatus = "error" | "loading" | "none" | "success";

type RPCFunction<T> = (...args: any[]) => Promise<T>;

// [status, response, error, call]
type useRPCResult<T> = [RPCStatus, T | undefined, any, () => Promise<[RPCStatus, T | undefined, any]>];

export default function useRPC<T>(userCall: RPCFunction<T>, ...args: any[]): useRPCResult<T> {
	const [callState, setCallState] = useState("none" as RPCStatus);
	const [response, setResponse] = useState(undefined as T | undefined);
	const [error, setError] = useState(undefined as any);

	async function handledCall(): Promise<[RPCStatus, T | undefined, any]> {
		setCallState("loading");

		await userCall(...args)
			.then((result) => {
				setCallState("success");
				setResponse(result);
				setError(undefined);
			})
			.catch((reason) => {
				setCallState("error");
				setResponse(undefined);
				setError(reason);

				throw reason;
			});

		return [callState, response, error];
	}

	return [callState, response, error, handledCall];
}
