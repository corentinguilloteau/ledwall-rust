import { ColorInput, Group, NumberInput, Select, SimpleGrid } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import {
	setSliceColor,
	setSliceHeight,
	setSliceSlabHeight,
	setSliceSlabWidth,
	setSliceWidth,
} from "../../../../data/store/slicesSlice";
import { RootState } from "../../../../data/store/store";

interface FormProps {
	sliceId: number;
}

export default function Form(props: FormProps) {
	const slice = useSelector((state: RootState) => state.slices.slices[props.sliceId]);

	const dispatch = useDispatch();

	function updateColumnsCount() {}

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
					value={slice.width}
					onChange={(val) => {
						if (val !== undefined) {
							dispatch(setSliceWidth({ sliceID: props.sliceId, payload: val }));
						}
					}}
					placeholder="5"
					label="Colonnes"
					styles={{ wrapper: { width: "100px" } }}
					min={0}
				/>
				<NumberInput
					defaultValue={3}
					value={slice.height}
					onChange={(val) => {
						if (val !== undefined) {
							dispatch(setSliceHeight({ sliceID: props.sliceId, payload: val }));
						}
					}}
					placeholder="3"
					label="Lignes"
					styles={{ wrapper: { width: "100px" } }}
					min={0}
				/>
			</Group>
			<Group>
				<NumberInput
					defaultValue={18}
					value={slice.slabHeight}
					onChange={(val) => {
						if (val !== undefined) {
							dispatch(setSliceSlabHeight({ sliceID: props.sliceId, payload: val }));
						}
					}}
					placeholder="18"
					label="Hauteur dalle"
					styles={{ wrapper: { width: "100px" } }}
					min={0}
				/>
				<NumberInput
					defaultValue={18}
					value={slice.slabWidth}
					onChange={(val) => {
						if (val !== undefined) {
							dispatch(setSliceSlabWidth({ sliceID: props.sliceId, payload: val }));
						}
					}}
					placeholder="18"
					label="Largeur dalle"
					styles={{ wrapper: { width: "100px" } }}
					min={0}
				/>
			</Group>
			<ColorInput
				value={slice.color}
				onChange={(val) => {
					dispatch(setSliceColor({ sliceID: props.sliceId, payload: val }));
				}}
				placeholder="Choisir une couleur"
				label="Couleur de test"
			/>
		</SimpleGrid>
	);
}
