import express from "express";

const rutasPrivadas = express.Router();
import authMiddleware from "../../middlewares/auth.middleware";

import expedientesRoutes from "./expedientes.routes";
import indiciosRoutes from "./indicios.routes";
import usuariosRoutes from "./usuarios.routes";
import expedienteEstadosRoutes from "./expediente-estados.routes";
import catalogsRoutes from "./catalogs.routes";
import reportsRoutes from "./reports.routes";

rutasPrivadas.use(authMiddleware);

rutasPrivadas.use("/expedientes", expedientesRoutes);
rutasPrivadas.use("/indicios", indiciosRoutes);
rutasPrivadas.use("/usuarios", usuariosRoutes);
rutasPrivadas.use("/expediente-estados", expedienteEstadosRoutes);
rutasPrivadas.use("/catalogs", catalogsRoutes);
rutasPrivadas.use("/reports", reportsRoutes);

export default rutasPrivadas;
