import { useMantineTheme } from "@mantine/core";
import { PlayerPlay, PlayerStop, TestPipe } from "tabler-icons-react";
import { LedwallControlStatus } from "../../data/types/LedwallControlTypes";

interface ControlPageIconProps {
	status: LedwallControlStatus;
}

function ControlPageIcon(props: ControlPageIconProps) {
	let theme = useMantineTheme();

	let sharedStyle = {
		height: "200px",
		width: "auto",
		border: `3px solid`,
		borderRadius: theme.radius.xl,
	};

	switch (props.status) {
		case "display":
			return (
				<PlayerPlay
					style={{
						...sharedStyle,
						stroke: theme.colors.green[6],
						fill: theme.colors.green[6],
						borderColor: theme.colors.green[6],
					}}
				/>
			);
		case "stop":
			return (
				<PlayerStop
					style={{
						...sharedStyle,
						stroke: theme.colors.red[6],
						fill: theme.colors.red[6],
						borderColor: theme.colors.red[6],
					}}
				/>
			);
		// case LedwallControlStatus.Testing:
		// 	return (
		// 		<TestPipe
		// 			style={{
		// 				...sharedStyle,
		// 				stroke: theme.colors.yellow[6],
		// 				borderColor: theme.colors.yellow[6],
		// 			}}
		// 		/>
		// 	);
	}
}

export default ControlPageIcon;
