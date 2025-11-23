import React, { useState, useEffect } from "react";
import MPLogo from "../assets/img/MP_logo.png";
import {
	AppBar,
	Toolbar,
	Typography,
	IconButton,
	Avatar,
	Menu,
	MenuItem,
	Box,
	ListItemText,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

type Props = {
	onToggleSidebar?: () => void;
	drawerWidth?: number;
	sidebarOpen?: boolean;
};

export default function Header({
	onToggleSidebar,
	drawerWidth,
	sidebarOpen,
}: Props) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [user, setUser] = useState<any | null>(null);
	const navigate = useNavigate();

	const [confirmOpen, setConfirmOpen] = useState(false);

	useEffect(() => {
		try {
			const u = localStorage.getItem("user");
			if (u) setUser(JSON.parse(u));
		} catch (e) {}
	}, []);

	function handleOpen(e: React.MouseEvent<HTMLElement>) {
		setAnchorEl(e.currentTarget);
	}
	function handleClose() {
		setAnchorEl(null);
	}

	function doLogout() {
		try {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		} catch (e) {}
		handleClose();
		setConfirmOpen(false);
		navigate("/login");
	}

	function handleLogout() {
		setConfirmOpen(true);
		handleClose();
	}

	return (
		<AppBar
			position="static"
			elevation={1}
			sx={{ backgroundColor: "#263A90", color: "#fff" }}
		>
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<IconButton
						edge="start"
						color="inherit"
						aria-label="toggle drawer"
						onClick={onToggleSidebar ?? (() => {})}
						sx={{ mr: 2 }}
					>
						{sidebarOpen ? <CloseIcon /> : <MenuIcon />}
					</IconButton>
					<Box sx={{ mr: 2, display: "inline-flex", alignItems: "center" }}>
						<Box
							sx={{
								backgroundColor: "#fff",
								p: 0.5,
								borderRadius: 1,
								display: "inline-flex",
							}}
						>
							<Box
								component="img"
								src={MPLogo}
								alt="logo"
								sx={{ height: 36, display: "block" }}
							/>
						</Box>
					</Box>
					<Typography
						variant="h6"
						component="div"
						sx={{ fontWeight: 700, color: "#fff" }}
					>
						DICRI - Sistema
					</Typography>
				</Box>

				<Box>
					<IconButton
						onClick={handleOpen}
						size="small"
						aria-controls={anchorEl ? "user-menu" : undefined}
						aria-haspopup="true"
						sx={{ color: "#fff" }}
					>
						<Avatar
							sx={{ width: 32, height: 32, bgcolor: "#fff", color: "#1B2668" }}
						>
							{user ? (user.nombres ? user.nombres.charAt(0) : "U") : "U"}
						</Avatar>
					</IconButton>
					<Menu
						id="user-menu"
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleClose}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
					>
						<MenuItem disabled>
							<ListItemText
								primary={
									user
										? `${user.nombres || ""} ${user.apellidos || ""}`.trim()
										: "Usuario"
								}
								secondary={user ? user.usuario : ""}
							/>
						</MenuItem>
						<MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
					</Menu>
					<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
						<DialogTitle>Confirmar cierre de sesión</DialogTitle>
						<DialogContent>
							<Typography>¿Estás seguro que deseas cerrar sesión?</Typography>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
							<Button color="error" onClick={doLogout}>
								Cerrar sesión
							</Button>
						</DialogActions>
					</Dialog>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
