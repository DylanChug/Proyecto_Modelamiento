import { Router } from 'express';
import { ejecutarCronDiario, ejecutarCronAlertas } from '../controllers/crons.controller.js';

const Cronrouter = Router();

// 📅 POST http://localhost:3000/api/cron/diario
Cronrouter.get('/diario', ejecutarCronDiario);

// 🔔 POST http://localhost:3000/api/cron/alertas
Cronrouter.get('/alertas', ejecutarCronAlertas);

export default Cronrouter;