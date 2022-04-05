import { Group, SimpleGrid } from "@mantine/core";
import LoadButton from "./Footer/LoadButton";
import SaveButton from "./Footer/SaveButton";
import StatusBadge from "./Footer/StatusBadge";

export default function Footer() {
	return (
		<SimpleGrid cols={2}>
			<Group position="left">
				<SaveButton />
				<LoadButton />
			</Group>
			<Group position="right">
				<StatusBadge />
			</Group>
		</SimpleGrid>
	);
}
