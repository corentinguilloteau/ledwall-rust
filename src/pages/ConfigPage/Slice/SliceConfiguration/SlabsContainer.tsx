import { Container } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { setSlab } from "../../../../data/store/slicesSlice";
import { RootState } from "../../../../data/store/store";
import SlabLine from "./SlabLine";

interface SlabsContainerProps {
	sliceId: number;
}

export default function SlabsContainer(props: SlabsContainerProps) {
	const slices = useSelector((state: RootState) => state.slices.slices);

	const dispatch = useDispatch();

	function onSlabIdChange(slabY: number, slabX: number, slabId: number) {
		dispatch(setSlab({ sliceID: props.sliceId, slabCoordinate: [slabX, slabY], payload: slabId }));
	}

	return (
		<Container
			style={{
				maxWidth: "none",
				padding: 0,
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
			p={0}>
			{(() => {
				if (slices.length > props.sliceId) {
					return slices[props.sliceId].slabs.map((line: number[], index: number) => {
						return (
							<SlabLine
								line={line}
								onSlabIdChange={(slabX: number, payload: number) => {
									onSlabIdChange(index, slabX, payload);
								}}></SlabLine>
						);
					});
				} else {
					return <div></div>;
					// TODO: Implement an error here
				}
			})()}
		</Container>
	);
}
