import { useState } from "react";

export type RPCStatus = "error" | "loading" | "none" | "success";

type RPCFunction<T> = (...args: any[]) => Promise<T>;

// [status, response, error, call]
type useRPCResult<T> = [RPCStatus, T | undefined, any, (...args: any[]) => Promise<T | undefined>];

export default function useRPC<T>(userCall: RPCFunction<T>, notifyError: boolean, ...args: any[]): useRPCResult<T> {
	const [callState, setCallState] = useState("none" as RPCStatus);
	const [response, setResponse] = useState(undefined as T | undefined);
	const [error, setError] = useState(undefined as any);

	async function handledCall(...localArgs: any[]): Promise<T | undefined> {
		setCallState("loading");

		console.log(localArgs);

		try {
			let result = await userCall(...args, ...localArgs);
			setCallState("success");
			setResponse(result);
			setError(undefined);
			return result;
		} catch (e) {
			setCallState("error");
			setResponse(undefined);
			setError(e);

			console.log(e);

			throw e;
		}
	}

	return [callState, response, error, handledCall];
}
