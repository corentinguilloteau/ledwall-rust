import { Container, NumberInput } from "@mantine/core";
interface SlabSelectorProps {
	slabId: number;
	onSlabIdChange: (payload: number) => void;
}

export function SlabSelector(props: SlabSelectorProps) {
	return (
		<Container
			sx={(theme) => ({
				display: "flex",
				flex: 1,
				alignItems: "center",
				alignContent: "center",
				borderRight: `solid 1px ${theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[5]}`,
				justifyContent: "center",
				"&:last-child": {
					borderRight: "none",
				},
			})}
			p="xl">
			<NumberInput
				defaultValue={18}
				value={props.slabId}
				onChange={(value) => {
					if (value !== undefined) {
						props.onSlabIdChange(value);
					}
				}}
				placeholder="18"
				styles={{ wrapper: { width: "100px" } }}
				min={0}
			/>
		</Container>
	);
}
