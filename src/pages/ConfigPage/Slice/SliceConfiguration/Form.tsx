import { ColorInput, Group, Loader, NumberInput, Select, SimpleGrid, Text } from "@mantine/core";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpoutNames } from "../../../../data/query/apis/spoutApi";
import {
	setSliceColor,
	setSliceHeight,
	setSliceSlabHeight,
	setSliceSlabWidth,
	setSliceSpoutName,
	setSliceWidth,
} from "../../../../data/store/slicesSlice";
import { RootState } from "../../../../data/store/store";

interface FormProps {
	sliceId: number;
}

function MessageInSelect(props: { message: string }) {
	return (
		<Text align="center" pt={3} pb={3} size="sm">
			{props.message}
		</Text>
	);
}

export default function Form(props: FormProps) {
	const slice = useSelector((state: RootState) => state.slices.slices[props.sliceId]);

	const dispatch = useDispatch();

	const { isLoading, isError, data, error } = useQuery("spoutNames", fetchSpoutNames);

	let spoutSelect;

	if (isError || data === undefined) {
		console.log(error);
		spoutSelect = (
			<Select
				label="Entrée Spout"
				placeholder="Choisissez..."
				maxDropdownHeight={280}
				itemComponent={MessageInSelect}
				data={[{ value: "error", message: "Une erreur s'est produite" }]}
			/>
		);
	} else if (isLoading) {
		spoutSelect = (
			<Select
				label="Entrée Spout"
				placeholder="Choisissez..."
				maxDropdownHeight={280}
				itemComponent={Loader}
				data={[{ value: "loading", color: "gray", disabled: true }]}
			/>
		);
	} else {
		if (data.length === 0) {
			spoutSelect = (
				<Select
					label="Entrée Spout"
					placeholder="Choisissez..."
					maxDropdownHeight={280}
					itemComponent={MessageInSelect}
					data={[{ value: "nodata", message: "Aucun emetteur Spout trouvé" }]}
				/>
			);
		} else {
			spoutSelect = (
				<Select
					label="Entrée Spout"
					placeholder="Choisissez..."
					maxDropdownHeight={280}
					data={data}
					value={slice.spoutName}
					onChange={(val) => {
						console.log(val);
						if (val !== null) {
							dispatch(setSliceSpoutName({ sliceID: props.sliceId, payload: val }));
						}
					}}
				/>
			);
		}
	}

	return (
		<SimpleGrid cols={1} ml="md">
			{spoutSelect}
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
