import { Box, Group, Navbar as MantineNavbar, ThemeIcon, Title, UnstyledButton, Text } from "@mantine/core";
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { AdjustmentsHorizontal, Home, Terminal2 } from "tabler-icons-react";

interface MainLinkProps {
	icon: React.ReactNode;
	color: string;
	label: string;
	link: string;
}

function MainLink({ icon, color, label }: MainLinkProps) {
	return (
		<UnstyledButton
			sx={(theme) => ({
				display: "block",
				width: "100%",
				padding: theme.spacing.xs,
				borderRadius: theme.radius.sm,
				marginBottom: theme.spacing.xs,
				color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

				"&:hover, .active &": {
					backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
				},
			})}>
			<Group>
				<ThemeIcon color={color} variant="light">
					{icon}
				</ThemeIcon>

				<Text size="sm">{label}</Text>
			</Group>
		</UnstyledButton>
	);
}

const data = [
	{ icon: <Home size={16} />, color: "pink", label: "Guide", link: "/guide" },
	{ icon: <AdjustmentsHorizontal size={16} />, color: "pink", label: "Configuration", link: "/config" },
	{ icon: <Terminal2 size={16} />, color: "pink", label: "Console", link: "/console" },
];

function MainLinks() {
	const links = data.map((link) => (
		<NavLink to={link.link} style={{ textDecoration: "none" }}>
			<MainLink {...link} key={link.label} />
		</NavLink>
	));
	return <div>{links}</div>;
}

class Navbar extends React.Component {
	render() {
		return (
			<MantineNavbar width={{ base: 260 }} p="xs">
				<MantineNavbar.Section mt="xs">
					<Box
						sx={(theme) => ({
							paddingLeft: theme.spacing.xs,
							paddingRight: theme.spacing.xs,
							paddingBottom: theme.spacing.lg,
							borderBottom: `1px solid ${
								theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
							}`,
							color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
						})}>
						<Title order={2}>Ledwall Controler</Title>
					</Box>
				</MantineNavbar.Section>
				<MantineNavbar.Section grow mt="md">
					<MainLinks />
				</MantineNavbar.Section>
			</MantineNavbar>
		);
	}
}

export default Navbar;
