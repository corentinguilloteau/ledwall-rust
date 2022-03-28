import {
	Button,
	ColorInput,
	Container,
	Grid,
	Group,
	NumberInput,
	Paper,
	ScrollArea,
	Select,
	SimpleGrid,
	Title,
} from "@mantine/core";
import { borderLeft, flexbox } from "@mui/system";
import React, { Component } from "react";
import { SlabSelector } from "../SlabSelector";

export class SliceConfiguration extends Component {
	render() {
		return (
			<Grid
				sx={(theme) => ({
					flex: "1 1 auto",
					overflow: "auto",
					flexWrap: "nowrap",
				})}
				m={0}
				p="md">
				<Grid.Col style={{ flex: "1", display: "flex", overflow: "auto" }} p="xs" mr="md">
					<Paper
						style={{ flex: "1", display: "flex", overflow: "auto" }}
						sx={(theme) => ({
							backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[4],
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
							<Container
								style={{
									maxWidth: "none",
									padding: 0,
									height: "100%",
									display: "flex",
									flexDirection: "column",
								}}
								p={0}>
								<Group
									grow
									spacing={0}
									sx={(theme) => ({
										borderBottom: `solid 1px ${
											theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[7]
										}`,
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
								<Group
									grow
									spacing={0}
									sx={(theme) => ({
										borderBottom: `solid 1px ${
											theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[7]
										}`,
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
								<Group
									grow
									spacing={0}
									sx={(theme) => ({
										borderBottom: `solid 1px ${
											theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[7]
										}`,
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
								<Group
									grow
									spacing={0}
									sx={(theme) => ({
										borderBottom: `solid 1px ${
											theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[7]
										}`,
										flex: 1,
										display: "flex",
										flexWrap: "nowrap",
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
							</Container>
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
					<SimpleGrid cols={1} ml="md">
						<Select
							label="Entrée Spout"
							placeholder="Choisissez..."
							data={[
								{ value: "react", label: "React" },
								{ value: "ng", label: "Angular" },
								{ value: "svelte", label: "Svelte" },
								{ value: "vue", label: "Vue" },
							]}
						/>
						<Group>
							<NumberInput
								defaultValue={5}
								placeholder="5"
								label="Colonnes"
								styles={{ wrapper: { width: "100px" } }}
								min={0}
							/>
							<NumberInput
								defaultValue={3}
								placeholder="3"
								label="Lignes"
								styles={{ wrapper: { width: "100px" } }}
								min={0}
							/>
						</Group>
						<Group>
							<NumberInput
								defaultValue={18}
								placeholder="18"
								label="Hauteur dalle"
								styles={{ wrapper: { width: "100px" } }}
								min={0}
							/>
							<NumberInput
								defaultValue={18}
								placeholder="18"
								label="Largeur dalle"
								styles={{ wrapper: { width: "100px" } }}
								min={0}
							/>
						</Group>
						<ColorInput placeholder="Choisir une couleur" label="Couleur de test" />
					</SimpleGrid>
				</Grid.Col>
			</Grid>
		);
	}
}
