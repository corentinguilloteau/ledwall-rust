import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import AppThemeHolder from "./AppThemeHolder";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { store } from "./data/store/store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import { NotificationsProvider } from "@mantine/notifications";
import { invoke } from "@tauri-apps/api";

const queryClient = new QueryClient();

function Index() {
	useEffect(() => {
		console.log("close");
		setTimeout(() => invoke("close_splashscreen"), 2000);
	}, []);

	return (
		<React.StrictMode>
			<Provider store={store}>
				<QueryClientProvider client={queryClient}>
					<NotificationsProvider autoClose={5000}>
						<BrowserRouter>
							<AppThemeHolder />
						</BrowserRouter>
					</NotificationsProvider>
				</QueryClientProvider>
			</Provider>
		</React.StrictMode>
	);
}

ReactDOM.render(<Index />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
