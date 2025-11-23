import express from "express";
import ExpedienteEstadoController from "../../controllers/expedienteEstado.controller";
import rolesMiddleware from "../../middlewares/roles.middleware";

const router = express.Router();

router.post(
	"/",
	rolesMiddleware.permit("tecnico", "coordinador"),
	(req, res, next) => ExpedienteEstadoController.crear(req, res, next)
);

router.get("/:id", (req, res, next) =>
	ExpedienteEstadoController.obtener(req, res, next)
);

router.put("/:id", rolesMiddleware.permit("coordinador"), (req, res, next) =>
	ExpedienteEstadoController.actualizar(req, res, next)
);
router.delete("/:id", rolesMiddleware.permit("coordinador"), (req, res, next) =>
	ExpedienteEstadoController.eliminar(req, res, next)
);

router.get("/por-expediente/:id", (req, res, next) =>
	ExpedienteEstadoController.listarPorExpediente(req, res, next)
);

export default router;
