import React, { useState, useEffect } from "react";
import { login as apiLogin } from "../services/auth";
import { useNavigate } from "react-router-dom";
import {
	Box,
	TextField,
	Button,
	Typography,
	Alert,
	CircularProgress,
	FormControlLabel,
	Checkbox,
	Card,
	CardContent,
} from "@mui/material";
import bg from "../assets/img/MP_fondo_login.jpg";

export default function Login() {
	const [usuario, setUsuario] = useState("");
	const [clave, setClave] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [remember, setRemember] = useState<boolean>(false);

	useEffect(() => {
		try {
			const rememberFlag = localStorage.getItem("remember");
			if (rememberFlag === "true") {
				const saved = localStorage.getItem("savedUsername");
				if (saved) setUsuario(saved);
				setRemember(true);
			}
		} catch (e) {}
	}, []);

	const navigate = useNavigate();

	useEffect(() => {
		const prev = document.body.style.margin;
		document.body.style.margin = "0";
		return () => {
			document.body.style.margin = prev;
		};
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const res = await apiLogin({ usuario, clave });
			localStorage.setItem("token", res.token);
			if (res.user) localStorage.setItem("user", JSON.stringify(res.user));

			if (remember) {
				try {
					localStorage.setItem("savedUsername", usuario);
					localStorage.setItem("remember", "true");
					if (
						(navigator as any).credentials &&
						(window as any).PasswordCredential
					) {
						try {
							const cred = new (window as any).PasswordCredential({
								id: usuario,
								password: clave,
								name: usuario,
							});
							await (navigator as any).credentials.store(cred);
						} catch (e) {
							console.warn(
								"Could not store credentials via Credential Management API",
								e
							);
						}
					}
				} catch (e) {
					console.warn("Remember flow failed", e);
				}
			} else {
				localStorage.removeItem("savedUsername");
				localStorage.setItem("remember", "false");
			}

			navigate("/app/expedientes");
		} catch (err: any) {
			setError(err?.message || "Error en inicio de sesión");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box sx={{ display: "flex", minHeight: "100vh" }}>
			{}
			<Box
				sx={{
					flex: 1,
					display: { xs: "none", md: "block" },
					backgroundImage: `url(${bg})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			/>

			{}
			<Box
				sx={{
					flex: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					p: 3,
				}}
			>
				<Card
					sx={{
						width: "100%",
						maxWidth: 440,
						borderRadius: 3,
						overflow: "hidden",
						boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
					}}
					elevation={6}
				>
					<CardContent sx={{ p: 4 }}>
						<Box sx={{ textAlign: "center", mb: 1 }}>
							<Typography
								component="h6"
								variant="subtitle1"
								color="text.secondary"
							>
								¡Bienvenido al Sistema de Gestión de Expedientes DICRI!
							</Typography>
						</Box>
						<Box sx={{ textAlign: "center", mb: 2 }}>
							<Typography component="h1" variant="h5">
								Iniciar sesión
							</Typography>
						</Box>

						{error && (
							<Alert severity="error" sx={{ width: "100%", mb: 2 }}>
								{error}
							</Alert>
						)}

						<Box component="form" onSubmit={handleSubmit}>
							<TextField
								label="Usuario"
								value={usuario}
								onChange={(e) => setUsuario(e.target.value)}
								margin="normal"
								required
								fullWidth
								autoFocus
							/>
							<TextField
								label="Clave"
								type="password"
								value={clave}
								onChange={(e) => setClave(e.target.value)}
								margin="normal"
								required
								fullWidth
							/>

							<FormControlLabel
								control={
									<Checkbox
										checked={remember}
										onChange={(e) => setRemember(e.target.checked)}
										color="primary"
									/>
								}
								label="Recordar credenciales"
							/>

							<Button
								type="submit"
								variant="contained"
								color="primary"
								fullWidth
								sx={{ mt: 2 }}
								disabled={loading}
								startIcon={
									loading ? (
										<CircularProgress color="inherit" size={18} />
									) : null
								}
							>
								{loading ? "Entrando..." : "Entrar"}
							</Button>
						</Box>
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
}
