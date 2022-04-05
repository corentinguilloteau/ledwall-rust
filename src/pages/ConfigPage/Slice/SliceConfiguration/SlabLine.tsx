import { Group } from "@mantine/core";
import React from "react";
import { SlabSelector } from "../SlabSelector";

export default function SlabLine() {
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
			<SlabSelector></SlabSelector>
			<SlabSelector></SlabSelector>
			<SlabSelector></SlabSelector>
			<SlabSelector></SlabSelector>
			<SlabSelector></SlabSelector>
			<SlabSelector></SlabSelector>
		</Group>
	);
}
