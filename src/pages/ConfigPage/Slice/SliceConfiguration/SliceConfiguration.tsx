import { Grid, Paper, ScrollArea } from "@mantine/core";
import { baseStyle } from "../../../../style/common";
import Form from "./Form";
import SlabsContainer from "./SlabsContainer";

interface SliceConfigurationProps {
	sliceId: number;
}

export function SliceConfiguration(props: SliceConfigurationProps) {
	return (
		<Grid
			style={{
				...baseStyle,
				flexWrap: "nowrap",
			}}
			m={0}
			p="md">
			<Grid.Col style={{ ...baseStyle }} p="xs" mr="md">
				<Paper
					sx={(theme) => ({
						...baseStyle,
						backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
					})}>
					<ScrollArea
						style={{ flex: 1, display: "flex" }}
						type="auto"
						styles={{
							viewport: {
								display: "flex",
								flex: 1,
								"& > div": {
									height: "100%",
								},
							},
						}}>
						<SlabsContainer sliceId={props.sliceId} />
					</ScrollArea>
				</Paper>
			</Grid.Col>
			<Grid.Col
				sx={(theme) => ({
					flex: "0 1 auto",
					borderLeft: `1px solid ${
						theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
					}`,
				})}>
				<Form />
			</Grid.Col>
		</Grid>
	);
}
