import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SessionTimeout from "../components/SessionTimeout";

const drawerWidth = 240;

const layoutStyle: React.CSSProperties = {
	display: "flex",
	height: "100vh",
	width: "100%",
};
const mainStyle: React.CSSProperties = {
	flex: 1,
	padding: 20,
	overflow: "auto",
	minWidth: 0,
};

export default function Layout() {
	const [drawerOpen, setDrawerOpen] = useState(true);

	const handleToggleSidebar = () => setDrawerOpen((s) => !s);

	const handleCloseSidebar = () => setDrawerOpen(false);

	return (
		<div style={layoutStyle}>
			<Sidebar
				open={drawerOpen}
				onClose={handleCloseSidebar}
				drawerWidth={drawerWidth}
			/>
			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					minWidth: 0,
				}}
			>
				<Header
					onToggleSidebar={handleToggleSidebar}
					drawerWidth={drawerWidth}
					sidebarOpen={drawerOpen}
				/>
				{}
				<SessionTimeout inactivityTimeMs={3 * 60 * 1000} />
				<main style={mainStyle}>
					<Outlet />
				</main>
			</div>
		</div>
	);
}
