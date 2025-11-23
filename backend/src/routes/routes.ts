import rutasPrivadas from "./private/routes";
import authRoutes from "./auth.routes";
import { Application } from "express";

export const routes = (server: Application) => {
	server.use("/api/auth", authRoutes);
	server.use("/api", rutasPrivadas);
};

export default routes;
