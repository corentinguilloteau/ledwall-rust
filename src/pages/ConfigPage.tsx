import { Tabs } from "@mantine/core";
import React from "react";
import { Plus } from "tabler-icons-react";
import Page from "./Page";

class ConfigPage extends React.Component {
	render() {
		return (
			<Page title="Configuration">
				<Tabs>
					<Tabs.Tab label="Slice 1"></Tabs.Tab>
					<Tabs.Tab label="Slice 2"></Tabs.Tab>
					<Tabs.Tab label="Slice 3"></Tabs.Tab>
					<Tabs.Tab icon={<Plus size="1rem"></Plus>}></Tabs.Tab>
				</Tabs>
			</Page>
		);
	}
}

export default ConfigPage;
