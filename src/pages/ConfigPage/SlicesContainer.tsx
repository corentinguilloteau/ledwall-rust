import { Paper, Tabs } from "@mantine/core";
import React from "react";
import { Plus } from "tabler-icons-react";
import { baseStyle } from "../../style/common";
import { SliceConfiguration } from "./Slice/SliceConfiguration";
import SliceLabel from "./Slice/SliceLabel";

export default function SlicesContainer() {
	return (
		<Paper
			sx={(theme) => ({
				...baseStyle,
				border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]}`,
				borderRadius: `${theme.radius["md"]}px`,
			})}>
			<Tabs
				styles={{
					root: {
						...baseStyle,
						flexDirection: "column",
					},
					body: { paddingTop: 0, ...baseStyle },
				}}>
				<Tabs.Tab label={<SliceLabel label={"Slice 1"} />} style={{ overflow: "auto" }}>
					<SliceConfiguration></SliceConfiguration>
				</Tabs.Tab>
				<Tabs.Tab icon={<Plus size="1rem"></Plus>}></Tabs.Tab>
			</Tabs>
		</Paper>
	);
}
