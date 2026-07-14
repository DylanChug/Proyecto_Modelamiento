import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { prisma } from './config/db.js';
import authrouter from './routes/auth.routes.js';
import actividadesrouter from './routes/actividades.routes.js';
import Configrouter from './routes/configuracion.routes.js';
import Optimizacionrouter from './routes/optimizacion.routes.js';
import metricasRouter from './routes/metricas.routes.js';
import Cronrouter from './routes/cron.routes.js';
const app = express();
app.use((req, res, next) => {
    console.log(`➡️ Petición entrante: ${req.method} ${req.url}`);
    next();
});
const PORT = Number(process.env.PORT) || 3000;
// Middlewares
app.use(cors({
    origin: ['https://modelamiento-prueba.netlify.app', 'http://localhost:5173'], // Tus URLs de producción y local
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // 👈 ¡Súper importante para que pase el token!
    credentials: true
}));
console.log("🔥 [TEST ENV GLOBAL] ¿Existe clave?:", !!process.env.CRON_SECRET_KEY);
console.log("🔥 [TEST ENV GLOBAL] ¿Existe base de datos?:", !!process.env.DATABASE_URL);
app.use(express.json());
// Agregar esto justo después de 'const app = express();'
app.use('/api/auth', authrouter);
app.use('/api/actividades', actividadesrouter);
app.use('/api/configuracion', Configrouter);
app.use('/api/optimizacion', Optimizacionrouter);
app.use('/api/metricas', metricasRouter);
app.use('/api/cron', Cronrouter);
// Ruta de prueba para verificar la conexión
app.get('/health', async (req, res) => {
    try {
        // Intenta hacer una consulta simple para verificar Railway
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'OK',
            message: 'Servidor Express corriendo y Prisma conectado a Railway con éxito.'
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Servidor activo, pero no se pudo conectar a la base de datos.',
            error: error instanceof Error ? error.message : error
        });
    }
});
// Arrancar el servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📌 Prueba la conexión en http://localhost:${PORT}/health`);
});
