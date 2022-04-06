import { ActionIcon, Group } from "@mantine/core";
import { useDispatch } from "react-redux";
import { X } from "tabler-icons-react";
import { removeSlice } from "../../../data/store/slicesSlice";

interface SliceLabelProps {
	label: string;
	sliceId: number;
}

export default function SliceLabel(props: SliceLabelProps) {
	const dispatch = useDispatch();

	return (
		<Group spacing="xs">
			{props.label}
			<ActionIcon
				size="xs"
				sx={(theme) => ({
					color: "inherit",
					"&:hover": {
						color: theme.colors.red[4],
					},
				})}
				p={0}
				onClick={() => {
					dispatch(removeSlice(props.sliceId));
				}}>
				<X />
			</ActionIcon>
		</Group>
	);
}
