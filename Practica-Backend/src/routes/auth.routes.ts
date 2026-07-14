import { Router } from 'express';
import { 
        autenticarUsuario, 
        enviarCodigoRecuperacion,  
        loginLocal, 
        registrarUsuarioLocal, 
        verificarCodigoYCambiarPassword 
    } from '../controllers/auth.controller.js'; // 👈 Asegúrate del .js

const router = Router();

// Endpoint para Google:
router.post('/login', autenticarUsuario);

// Endpoint para Formulario Local: 
router.post('/login-local', loginLocal);


router.post('/register', registrarUsuarioLocal)


router.post('/solicitar-codigo', enviarCodigoRecuperacion);


router.post('/confirmar-codigo', verificarCodigoYCambiarPassword);
export default router;