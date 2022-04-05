import { ColorInput, Group, NumberInput, Select, SimpleGrid } from "@mantine/core";

export default function Form() {
	return (
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
	);
}
