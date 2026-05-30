import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de verificación inicial
app.get('/', (req, res) => {
    res.json({ status: "online", servicio: "SmartAcademiTime API" });
});

// Endpoint principal: Recepción, procesamiento y subdivisión automática de tareas
app.post('/api/tareas', (req, res) => {
    const { titulo, asignatura, deadline, dificultad } = req.body;
    
    // Regla de negocio: Subdivisión automática si la complejidad es alta
    if (dificultad === 'Difícil' || dificultad === 'Dificil') {
        const tareasSubdivididas = [
            { 
                id: `sub-${Date.now()}-1`, 
                titulo: `${titulo} - Parte 1`, 
                asignatura, 
                deadline, 
                dificultad, 
                estado: 'Pendiente' 
            },
            { 
                id: `sub-${Date.now()}-2`, 
                titulo: `${titulo} - Parte 2`, 
                asignatura, 
                deadline, 
                dificultad, 
                estado: 'Pendiente' 
            }
        ];
        return res.status(201).json({
            subdividido: true,
            mensaje: "Tarea compleja fragmentada en 2 bloques de enfoque.",
            tareas: tareasSubdivididas
        });
    }

    // Flujo normal para tareas de complejidad estándar
    const nuevaTarea = { 
        id: `task-${Date.now()}`, 
        titulo, 
        asignatura, 
        deadline, 
        dificultad, 
        estado: 'Pendiente' 
    };
    
    res.status(201).json({
        subdividido: false,
        mensaje: "Tarea agendada de forma individual.",
        tareas: [nuevaTarea]
    });
});

// Arranque de la aplicación
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 API corriendo en: http://localhost:${PORT}`);
    console.log(`=================================================`);
});