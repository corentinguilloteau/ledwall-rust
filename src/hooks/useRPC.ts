import { useState } from "react";

export type RPCStatus = "error" | "loading" | "none" | "success";

type RPCFunction<T> = (...args: any[]) => Promise<T>;

// [status, response, error, call]
type useRPCResult<T> = [RPCStatus, T | undefined, any, () => Promise<T | undefined>];

export default function useRPC<T>(userCall: RPCFunction<T>, ...args: any[]): useRPCResult<T> {
	const [callState, setCallState] = useState("none" as RPCStatus);
	const [response, setResponse] = useState(undefined as T | undefined);
	const [error, setError] = useState(undefined as any);

	async function handledCall(): Promise<T | undefined> {
		setCallState("loading");

		try {
			let result = await userCall(...args);
			setCallState("success");
			setResponse(result);
			setError(undefined);
			return result;
		} catch (e) {
			setCallState("error");
			setResponse(undefined);
			setError(e);

			throw e;
		}
	}

	return [callState, response, error, handledCall];
}
