import { Global, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "react-query";
import MainApp from "./MainApp";
import NotificationHandler from "./NotificationHandler";

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<NotificationHandler>
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
			</NotificationHandler>
		</QueryClientProvider>
	);
}

export default App;
