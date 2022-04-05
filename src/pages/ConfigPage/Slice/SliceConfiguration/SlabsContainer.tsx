import { Container } from "@mantine/core";
import SlabLine from "./SlabLine";

export default function SlabsContainer() {
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
			<SlabLine />
			<SlabLine />
			<SlabLine />
			<SlabLine />
			<SlabLine />
			<SlabLine />
		</Container>
	);
}
