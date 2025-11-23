import express from "express";
import UsuariosController from "../../controllers/usuarios.controller";

const router = express.Router();

router.post("/", (req, res, next) => UsuariosController.crear(req, res, next));
router.get("/", (req, res, next) => UsuariosController.listar(req, res, next));
router.get("/:id", (req, res, next) =>
	UsuariosController.obtener(req, res, next)
);
router.put("/:id", (req, res, next) =>
	UsuariosController.actualizar(req, res, next)
);
router.delete("/:id", (req, res, next) =>
	UsuariosController.eliminar(req, res, next)
);

export default router;
