import jwt from 'jsonwebtoken';
const JWT_Secret = process.env.CONTRASENIA_JWT || 'default_secret_key'; // Asegúrate de tener una clave secreta en tu archivo .env
export const verificarToken = (req, res, next) => {
    // 🔍 Extraer el token de la cabecera Authorization (Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: 'ERROR', message: 'Acceso denegado. No se proporcionó un token.' });
    }
    try {
        // Validar el token usando la llave maestra
        const decoded = jwt.verify(token, JWT_Secret);
        req.usuario = decoded; // Guardamos los datos decodificados (como el email) en la petición
        next(); // Damos paso a la función del controlador
    }
    catch (error) {
        return res.status(403).json({ status: 'ERROR', message: 'Token inválido o expirado.' });
    }
};
