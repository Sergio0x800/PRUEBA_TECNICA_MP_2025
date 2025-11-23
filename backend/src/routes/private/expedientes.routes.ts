import express from "express";
import ExpedienteController from "../../controllers/expedientes.controller";
import rolesMiddleware from "../../middlewares/roles.middleware";

const router = express.Router();

router.post("/", rolesMiddleware.deny("coordinador"), (req, res, next) =>
	ExpedienteController.crear(req, res, next)
);

router.get("/", rolesMiddleware.permit("coordinador"), (req, res, next) =>
	ExpedienteController.listarTodos(req, res, next)
);

router.get("/:id", (req, res, next) =>
	ExpedienteController.obtener(req, res, next)
);

router.get("/por-usuario/:id", (req, res, next) =>
	ExpedienteController.listarPorUsuario(req, res, next)
);

router.put("/:id", rolesMiddleware.deny("coordinador"), (req, res, next) =>
	ExpedienteController.actualizar(req, res, next)
);

router.delete("/:id", rolesMiddleware.deny("coordinador"), (req, res, next) =>
	ExpedienteController.eliminar(req, res, next)
);

export default router;
