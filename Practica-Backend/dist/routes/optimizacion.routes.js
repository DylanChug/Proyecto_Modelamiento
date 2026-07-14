import { Router } from 'express';
import { confirmarReoptimizacionMasiva, generarPropuestaOptimizada, reoptimizarAgendaSemanal } from '../controllers/optimizacion.controller.js';
import { verificarToken } from '../middleware/auth.middleware.js';
const Optimizacionrouter = Router();
Optimizacionrouter.post('/generar-propuesta', verificarToken, generarPropuestaOptimizada);
Optimizacionrouter.post('/reoptimizar-semana', verificarToken, reoptimizarAgendaSemanal);
Optimizacionrouter.post('/confirmar-reoptimizacion', verificarToken, confirmarReoptimizacionMasiva);
export default Optimizacionrouter;
