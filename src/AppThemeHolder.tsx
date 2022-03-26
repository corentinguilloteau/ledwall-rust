import { MantineProvider } from "@mantine/core";
import MainApp from "./MainApp";

function App() {
	return (
		<MantineProvider
			theme={{
				colorScheme: "dark",
			}}>
			<MainApp />
		</MantineProvider>
	);
}

export default App;
