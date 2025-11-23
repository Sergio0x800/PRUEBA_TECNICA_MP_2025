import React from "react";
import MPLogo from "../assets/img/MP_logo.png";
import {
	Box,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListItemIcon,
	Divider,
	Toolbar,
	Avatar,
	Typography,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate, useLocation } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

type Props = {
	open?: boolean;
	onClose?: () => void;
	drawerWidth?: number;
};

export default function Sidebar({ open, onClose, drawerWidth = 240 }: Props) {
	const navigate = useNavigate();
	const location = useLocation();

	const userJson =
		typeof window !== "undefined" ? localStorage.getItem("user") : null;
	let user: any = null;
	try {
		user = userJson ? JSON.parse(userJson) : null;
	} catch (e) {
		user = null;
	}

	const [confirmOpen, setConfirmOpen] = React.useState(false);

	const drawer = (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<Toolbar
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					px: 2,
				}}
			>
				<Box sx={{ backgroundColor: "#fff", p: 0.5, borderRadius: 1 }}>
					<Box
						component="img"
						src={MPLogo}
						alt="logo"
						sx={{ height: 48, display: "block" }}
					/>
				</Box>
			</Toolbar>
			<List>
				<ListItem disablePadding>
					<ListItemButton
						selected={location.pathname.startsWith("/app/expedientes")}
						onClick={() => {
							navigate("/app/expedientes");
							if (onClose) onClose();
						}}
						sx={{
							"&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
							"&.Mui-selected": { backgroundColor: "rgba(255,255,255,0.08)" },
						}}
					>
						<ListItemIcon sx={{ color: "#fff" }}>
							<FolderOpenIcon />
						</ListItemIcon>
						<ListItemText
							primary={"Expedientes"}
							primaryTypographyProps={{ sx: { color: "#fff" } }}
						/>
					</ListItemButton>
				</ListItem>
				{(() => {
					const roles = Array.isArray(user?.roles) ? user.roles : [];
					const isCoord = roles.some((r: any) => {
						const name =
							typeof r === "string"
								? r
								: r?.nombre || r?.nombre_rol || r?.name || "";
						return (
							String(name).toLowerCase() === "coordinador" ||
							String(name).toLowerCase() === "admin"
						);
					});
					if (!isCoord) return null;
					return (
						<ListItem disablePadding>
							<ListItemButton
								selected={location.pathname.startsWith("/app/reporteria")}
								onClick={() => {
									navigate("/app/reporteria");
									if (onClose) onClose();
								}}
								sx={{
									"&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
									"&.Mui-selected": {
										backgroundColor: "rgba(255,255,255,0.08)",
									},
								}}
							>
								<ListItemIcon sx={{ color: "#fff" }}>
									<AssessmentIcon />
								</ListItemIcon>
								<ListItemText
									primary={"Reportería"}
									primaryTypographyProps={{ sx: { color: "#fff" } }}
								/>
							</ListItemButton>
						</ListItem>
					);
				})()}
			</List>

			{}
			<Box sx={{ flex: 1 }} />
			<Divider sx={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
			<Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
				<Avatar sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }}>
					{user && (user.nombres || user.usuario)
						? String((user.nombres || user.usuario)[0]).toUpperCase()
						: "U"}
				</Avatar>
				<Box sx={{ flex: 1 }}>
					<Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
						{user?.nombres || user?.usuario || "Usuario"}{" "}
						{user?.apellidos ? user.apellidos : ""}
					</Typography>
					<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
						{user && Array.isArray(user.roles) && user.roles.length
							? user.roles.map((r: any) => r.nombre).join(", ")
							: user?.rol || user?.perfil || "Miembro"}
					</Typography>
				</Box>
				<IconButton sx={{ color: "#fff" }} onClick={() => setConfirmOpen(true)}>
					<ExitToAppIcon />
				</IconButton>
			</Box>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>Cerrar sesión</DialogTitle>
				<DialogContent>
					<Typography>¿Estás seguro que deseas cerrar sesión?</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
					<Button
						color="error"
						onClick={() => {
							setConfirmOpen(false);
							localStorage.removeItem("token");
							localStorage.removeItem("user");
							navigate("/login");
						}}
					>
						Cerrar sesión
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);

	return (
		<Box
			component="nav"
			sx={{
				width: { md: open ? drawerWidth : 0 },
				flexShrink: { md: 0 },
				transition: "width 200ms ease",
				overflow: "hidden",
			}}
			aria-label="mailbox folders"
		>
			<Drawer
				variant="persistent"
				open={Boolean(open)}
				sx={{
					display: { xs: "none", md: open ? "block" : "none" },
					"& .MuiDrawer-paper": {
						boxSizing: "border-box",
						width: drawerWidth,
						backgroundColor: "#263A90",
						color: "#fff",
					},
				}}
			>
				{drawer}
			</Drawer>

			<Drawer
				variant="temporary"
				open={Boolean(open)}
				onClose={onClose}
				ModalProps={{ keepMounted: true }}
				sx={{
					display: { xs: "block", md: "none" },
					"& .MuiDrawer-paper": {
						boxSizing: "border-box",
						width: drawerWidth,
						backgroundColor: "#263A90",
						color: "#fff",
					},
				}}
			>
				{drawer}
			</Drawer>
		</Box>
	);
}
