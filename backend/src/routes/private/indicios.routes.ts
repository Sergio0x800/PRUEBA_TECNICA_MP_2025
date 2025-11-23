import express from "express";
import IndicioController from "../../controllers/indicios.controller";
import rolesMiddleware from "../../middlewares/roles.middleware";

const router = express.Router();

router.post("/", rolesMiddleware.deny("coordinador"), (req, res, next) =>
	IndicioController.crear(req, res, next)
);
router.get("/:id", (req, res, next) =>
	IndicioController.obtener(req, res, next)
);
router.get("/por-expediente/:id", (req, res, next) =>
	IndicioController.listarPorExpediente(req, res, next)
);
router.put("/:id", rolesMiddleware.deny("coordinador"), (req, res, next) =>
	IndicioController.actualizar(req, res, next)
);
router.delete("/:id", rolesMiddleware.deny("coordinador"), (req, res, next) =>
	IndicioController.eliminar(req, res, next)
);

export default router;
