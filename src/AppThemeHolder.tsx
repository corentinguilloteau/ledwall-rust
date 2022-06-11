import { Global, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "react-query";
import MainApp from "./MainApp";
import { emit, listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useReceiveRemoteData } from "./hooks/useRemoteState";
import { Check, ExclamationMark, InfoCircle, X } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";

const queryClient = new QueryClient();

interface NotificationPayload {
	title: string;
	message: string;
	kind: string;
	consoleOnly: boolean;
	origin: string;
}

function App() {
	useReceiveRemoteData("backend-notification", (p) => {
		let payload = p as NotificationPayload;
		let notification = {
			title: payload.title,
			message: payload.message,
			color: "",
			icon: <InfoCircle size={18} />,
		};

		switch (payload.kind) {
			case "info":
				notification.color = "blue";
				notification.icon = <InfoCircle size={18} />;
				break;
			case "success":
				notification.color = "teal";
				notification.icon = <Check size={18} />;

				break;
			case "warning":
				notification.color = "orange";
				notification.icon = <ExclamationMark size={18} />;

				break;
			case "error":
				notification.color = "red";
				notification.icon = <X size={18} />;

				break;
		}

		showNotification(notification);
	});

	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider
				theme={{
					colorScheme: "dark",
					primaryColor: "violet",
				}}>
				<Global
					styles={(theme) => ({
						"*, *::before, *::after": {
							boxSizing: "border-box",
						},

						body: {
							...theme.fn.fontStyles(),
							backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
							color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
							lineHeight: theme.lineHeight,
						},
					})}
				/>
				<MainApp />
			</MantineProvider>
		</QueryClientProvider>
	);
}

export default App;
