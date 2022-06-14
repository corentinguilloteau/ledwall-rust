import { Badge, Button, Tooltip, Text } from "@mantine/core";
import { useSelector } from "react-redux";
import { RootState } from "../../../data/store/store";
import { SlicesErrors } from "../../../data/types/Slice";

function getConfigErrors(errors: SlicesErrors) {
	let errs = Object.entries(errors.slabErrors)
		.filter((entry) => entry[1].length > 0)
		.map(
			([slabId, slices]) =>
				`La dalle ${slabId} est utilisée plusieurs fois (slices ${slices
					.reduce((p, c) => p + `${c}, `, "")
					.slice(0, -2)}).` as String
		);

	errs = errs.concat(Object.values(errors.sliceErrors).flat());

	let formattedErrs = errs.map((err) => <Text size="sm">{err}</Text>);

	return formattedErrs;
}

export default function StatusBadge() {
	const errors = useSelector((state: RootState) => state.slices.errors);

	let errs = getConfigErrors(errors);

	return (
		<Tooltip
			wrapLines
			width={350}
			withArrow
			placement="end"
			transition="fade"
			transitionDuration={200}
			label={errs}
			disabled={errs.length === 0}>
			<Badge size="md" variant="filled" color={errs.length === 0 ? "green" : "red"}>
				{errs.length === 0 ? "Aucune erreur" : `${errs.length} erreur${errs.length > 1 ? "s" : ""}`}
			</Badge>
		</Tooltip>
	);
}
