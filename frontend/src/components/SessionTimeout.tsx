import React, { useEffect, useRef, useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
	inactivityTimeMs?: number;
	warningDurationMs?: number;
};

export default function SessionTimeout({
	inactivityTimeMs = 14 * 60 * 1000,
	warningDurationMs = 60 * 1000,
}: Props) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [remainingMs, setRemainingMs] = useState(warningDurationMs);
	const inactivityTimer = useRef<number | null>(null);
	const countdownTimer = useRef<number | null>(null);
	const lastActivity = useRef<number>(Date.now());

	useEffect(() => {
		const events = [
			"mousemove",
			"mousedown",
			"keydown",
			"touchstart",
			"scroll",
		];

		const reset = () => {
			lastActivity.current = Date.now();
			if (open) {
				handleContinue();
				return;
			}
			if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
			inactivityTimer.current = window.setTimeout(
				() => showWarning(),
				inactivityTimeMs
			);
		};

		events.forEach((e) => window.addEventListener(e, reset));
		inactivityTimer.current = window.setTimeout(
			() => showWarning(),
			inactivityTimeMs
		);

		return () => {
			events.forEach((e) => window.removeEventListener(e, reset));
			if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
			if (countdownTimer.current) window.clearInterval(countdownTimer.current);
		};
	}, []);

	function showWarning() {
		setRemainingMs(warningDurationMs);
		setOpen(true);
		const start = Date.now();
		countdownTimer.current = window.setInterval(() => {
			const elapsed = Date.now() - start;
			const rem = Math.max(0, warningDurationMs - elapsed);
			setRemainingMs(rem);
			if (rem <= 0) {
				if (countdownTimer.current)
					window.clearInterval(countdownTimer.current);
				doLogout();
			}
		}, 1000);
	}

	function handleContinue() {
		setOpen(false);
		setRemainingMs(warningDurationMs);
		if (countdownTimer.current) {
			window.clearInterval(countdownTimer.current);
			countdownTimer.current = null;
		}

		if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
		inactivityTimer.current = window.setTimeout(
			() => showWarning(),
			inactivityTimeMs
		);
	}

	function doLogout() {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setOpen(false);
		if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
		if (countdownTimer.current) window.clearInterval(countdownTimer.current);
		navigate("/login");
	}

	const secondsLeft = Math.ceil(remainingMs / 1000);

	return (
		<Dialog open={open} onClose={handleContinue} disableEscapeKeyDown>
			<DialogTitle>Sesión inactiva</DialogTitle>
			<DialogContent>
				<Typography>
					Has estado inactivo. ¿Deseas continuar conectado? Se cerrará sesión en{" "}
					{secondsLeft} segundos si no confirmas.
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={doLogout} color="inherit">
					Cerrar sesión
				</Button>
				<Button
					onClick={handleContinue}
					variant="contained"
					color="primary"
					autoFocus
				>
					Seguir conectado
				</Button>
			</DialogActions>
		</Dialog>
	);
}
