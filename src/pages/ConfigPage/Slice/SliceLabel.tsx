import { ActionIcon, Group } from "@mantine/core";
import React from "react";
import { X } from "tabler-icons-react";

interface SliceLabelProps {
	label: string;
}

export default function SliceLabel(props: SliceLabelProps) {
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
				p={0}>
				<X />
			</ActionIcon>
		</Group>
	);
}
