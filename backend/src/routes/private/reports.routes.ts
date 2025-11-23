import express from "express";
import ReportController from "../../controllers/report.controller";
import rolesMiddleware from "../../middlewares/roles.middleware";

const router = express.Router();

router.get(
	"/summary",
	rolesMiddleware.permit("coordinador", "admin"),
	(req, res, next) => ReportController.summary(req, res, next)
);
router.get(
	"/timeseries",
	rolesMiddleware.permit("coordinador", "admin"),
	(req, res, next) => ReportController.timeseries(req, res, next)
);

export default router;
