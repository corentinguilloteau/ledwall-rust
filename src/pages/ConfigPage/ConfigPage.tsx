import { Grid } from "@mantine/core";
import React from "react";
import Page from "../Page";
import { baseStyle } from "../../style/common";
import SlicesContainer from "./SlicesContainer";
import Footer from "./Footer";

class ConfigPage extends React.Component {
	render() {
		return (
			<Page title="Configuration">
				<Grid
					style={{
						...baseStyle,
						flexDirection: "column",
						flexWrap: "nowrap",
					}}>
					<Grid.Col style={{ ...baseStyle }}>
						<SlicesContainer />
					</Grid.Col>
					<Grid.Col style={{ flex: "0 1 0" }}>
						<Footer></Footer>
					</Grid.Col>
				</Grid>
			</Page>
		);
	}
}

export default ConfigPage;
