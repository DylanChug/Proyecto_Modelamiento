import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir datos en formato JSON

// Ruta de prueba de la API
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "servidor operativo", 
    message: "El backend del Gestor de Horarios está listo para procesar algoritmos." 
  });
});

// Encender Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto http://localhost:${PORT}`);
});