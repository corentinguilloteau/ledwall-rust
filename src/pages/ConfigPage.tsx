import { Button, Grid, Group, Tabs } from "@mantine/core";
import React from "react";
import { Plus } from "tabler-icons-react";
import Page from "./Page";

class ConfigPage extends React.Component {
	render() {
		return (
			<Page title="Configuration">
				<Grid style={{ flex: "1", flexDirection: "column" }}>
					<Grid.Col style={{ flex: "1 0 auto" }}>
						<Tabs>
							<Tabs.Tab label="Slice 1"></Tabs.Tab>
							<Tabs.Tab label="Slice 2"></Tabs.Tab>
							<Tabs.Tab label="Slice 3"></Tabs.Tab>
							<Tabs.Tab icon={<Plus size="1rem"></Plus>}></Tabs.Tab>
						</Tabs>
					</Grid.Col>
					<Grid.Col style={{ flex: "0 1 0" }}>
						<Group position="right">
							<Button>Enregistrer</Button>
							<Button>Charger</Button>
						</Group>
					</Grid.Col>
				</Grid>
			</Page>
		);
	}
}

export default ConfigPage;
