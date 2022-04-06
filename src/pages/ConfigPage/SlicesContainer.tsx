import { Paper, Tabs } from "@mantine/core";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "tabler-icons-react";
import { addSlice } from "../../data/store/slicesSlice";
import { RootState } from "../../data/store/store";
import { baseStyle } from "../../style/common";
import { SliceConfiguration } from "./Slice/SliceConfiguration";
import SliceLabel from "./Slice/SliceLabel";

export default function SlicesContainer() {
	const slices = useSelector((state: RootState) => state.slices.slices);

	const dispatch = useDispatch();

	const [activeTab, setActiveTab] = useState(0);

	function onTabChange(active: number, tabKey: string) {
		if (tabKey === "addTab") {
			dispatch(addSlice());

			setActiveTab(slices.length + 1);
		} else if (tabKey === "nullTab") {
		} else {
			let numberTabKey = Number.parseInt(tabKey);

			if (numberTabKey !== undefined) {
				setActiveTab(numberTabKey);
			}
		}
	}

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
					tabControl: {
						"&:first-child": {
							padding: 0,
						},
					},
				}}
				active={activeTab}
				onTabChange={onTabChange}>
				<Tabs.Tab style={{ overflow: "auto" }} tabKey={"nullTab"}></Tabs.Tab>
				{slices.map((slice, index) => {
					return (
						<Tabs.Tab
							tabKey={(index + 1).toString()}
							key={index}
							label={<SliceLabel sliceId={index} label={"Slice " + index} />}
							style={{ overflow: "auto" }}>
							<SliceConfiguration sliceId={index}></SliceConfiguration>
						</Tabs.Tab>
					);
				})}
				<Tabs.Tab icon={<Plus size="1rem"></Plus>} tabKey="addTab"></Tabs.Tab>
			</Tabs>
		</Paper>
	);
}
