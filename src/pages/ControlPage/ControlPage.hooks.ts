import { useState } from "react";
import { useQuery } from "react-query";
import { LedwallStatusKeys } from "../../data/query/QueryKeys";

function useGetStatus() {
	function fetch() {}

	return useQuery(LedwallStatusKeys.all, fetch);
}

function useMutateStatus() {}

export { useGetStatus, useMutateStatus };
