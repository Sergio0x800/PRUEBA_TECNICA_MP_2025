import React from "react";
import Login from "./components/Login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Expedientes from "./pages/Expedientes";
import ExpedienteNuevo from "./pages/ExpedienteNuevo";
import ExpedienteDetalle from "./pages/ExpedienteDetalle";
import IndicioNuevo from "./pages/IndicioNuevo";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/login" element={<Login />} />
				<Route
					path="/app"
					element={
						<ProtectedRoute>
							<Layout />
						</ProtectedRoute>
					}
				>
					<Route index element={<div>Bienvenido</div>} />
					<Route path="expedientes" element={<Expedientes />} />
					<Route path="expedientes/nuevo" element={<ExpedienteNuevo />} />
					<Route path="expedientes/:id/editar" element={<ExpedienteNuevo />} />
					<Route path="expedientes/:id" element={<ExpedienteDetalle />} />
					<Route path="reporteria" element={<Reports />} />
					<Route
						path="expedientes/:id/indicios/nuevo"
						element={<IndicioNuevo />}
					/>
					<Route
						path="expedientes/:id/indicios/:idInd/editar"
						element={<IndicioNuevo />}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
