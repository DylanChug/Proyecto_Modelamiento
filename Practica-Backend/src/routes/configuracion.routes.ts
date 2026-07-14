import { Router } from 'express';
import { 
    guardarConfiguracionUsuario, 
    obtenerConfiguracionUsuario } 
from '../controllers/configuracion.controller.js';
import { verificarToken } from '../middleware/auth.middleware.js';

const Configrouter = Router();

Configrouter.get('/horarios', verificarToken, obtenerConfiguracionUsuario);

Configrouter.post('/horarios', verificarToken, guardarConfiguracionUsuario);

export default Configrouter;