import express from "express";
import AuthController from "../controllers/auth.controller";

const router = express.Router();

router.post("/login", (req, res, next) => AuthController.login(req, res, next));

export default router;
