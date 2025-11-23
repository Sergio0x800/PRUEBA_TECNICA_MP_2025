import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
	children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
	const location = useLocation();

	const token = localStorage.getItem("token");

	if (!token) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	return <>{children}</>;
}
