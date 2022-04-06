import { Group } from "@mantine/core";
import React from "react";
import { SlabSelector } from "./SlabSelector";

interface SlabLineProps {
	line: number[];
	onSlabIdChange: (slabX: number, payload: number) => void;
}

export default function SlabLine(props: SlabLineProps) {
	return (
		<Group
			grow
			spacing={0}
			sx={(theme) => ({
				borderBottom: `solid 1px ${theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[5]}`,
				flex: 1,
				flexWrap: "nowrap",
				display: "flex",
				alignItems: "stretch",
				"&:last-child": {
					borderBottom: "none",
				},
			})}>
			{props.line.map((slab: number, index: number) => {
				return (
					<SlabSelector
						slabId={slab}
						onSlabIdChange={(newSlabId: number) => {
							props.onSlabIdChange(index, newSlabId);
						}}></SlabSelector>
				);
			})}
		</Group>
	);
}
