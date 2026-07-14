import { Router } from 'express';
import { 
    actualizarActividad, 
    crearActividad, 
    eliminarActividad, 
    obtenerActividades } 
from '../controllers/actividades.controller.js';

import { verificarToken } from '../middleware/auth.middleware.js';

const actividadesrouter = Router();

// 🔐 Protegemos la ruta inyectando el middleware 'verificarToken' antes del controlador
actividadesrouter.get('/mis-actividades', verificarToken, obtenerActividades);

actividadesrouter.post('/crear-actividad', verificarToken, crearActividad);

actividadesrouter.put('/actualizar-actividad', verificarToken, actualizarActividad)

actividadesrouter.delete('/eliminar-actividad/:id_actividad', verificarToken, eliminarActividad);

export default actividadesrouter;