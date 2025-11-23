import express from "express";
import CatalogsController from "../../controllers/catalogs.controller";

const router = express.Router();

router.get("/estados", (req, res, next) =>
	CatalogsController.listarEstados(req, res, next)
);
router.get("/departamentos", (req, res, next) =>
	CatalogsController.listarDepartamentos(req, res, next)
);
router.get("/municipios", (req, res, next) =>
	CatalogsController.listarMunicipios(req, res, next)
);
router.get("/tipos-indicio", (req, res, next) =>
	CatalogsController.listarTiposIndicio(req, res, next)
);

export default router;
