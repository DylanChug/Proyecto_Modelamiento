import { Router } from "express";
import { verificarToken } from "../middleware/auth.middleware.js";
import { obtenerProgresoMensual } from "../controllers/metricas.controller.js";

const metricasRouter = Router();

metricasRouter.get("/progreso", verificarToken, obtenerProgresoMensual);

export default metricasRouter;
