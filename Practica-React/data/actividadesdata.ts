
const actividadesEstrategiaFinalBD = [
  // ==========================================
  // RUTINAS SEMANALES (dia_sugerido: número del 1 al 7)
  // ==========================================
  {
    id: 1,
    tipo_actividad: "RUTINA",
    nombre: "Entrenamiento de Fútbol",
    descripcion: "Materia: Ninguna. Acción: Práctica como arquero y preparación física.",
    dia_sugerido: [2, 4], // 4 = Jueves (Recurrente, se proyecta dinámicamente)
    hora_inicio: "19:00",
    hora_fin: "21:00",
    duracion_minutos: 120,
    prioridad: "Media",
    dificultad: 2,
    nivel_estres: "Bajo",
    justificacion_pedagogica: "Configurado por el usuario.",
    descanso_posterior: false
  },

  // ==========================================
  // ACTIVIDADES FIJAS / EVENTOS ÚNICOS (dia_sugerido: fecha YYYY-MM-DD fija)
  // ==========================================
  {
    id: 2,
    tipo_actividad: "EVENTO",
    nombre: "Reunión de Avance: Taxi Compartido",
    descripcion: "Materia: Modelamiento de Software. Acción: Coordinar repositorio de GitHub y endpoints con el equipo de desarrollo.",
    dia_sugerido: ["2026-06-18"], // Jueves fijo (Evento único, no se repite la otra semana)
    hora_inicio: "11:30",
    hora_fin: "13:00",
    duracion_minutos: 90,
    prioridad: "Alta",
    dificultad: 3,
    nivel_estres: "Moderado",
    justificacion_pedagogica: "Evento único programado manualmente por el estudiante.",
    descanso_posterior: false
  },
  {
    id: 3,
    tipo_actividad: "EVENTO",
    nombre: "Examen Presencial de Redes",
    descripcion: "Materia: Redes de Computadoras. Acción: Evaluación teórica sobre subredes VLSM y configuración de routers Capa 3.",
    dia_sugerido: ["2026-06-25"], // Lunes fijo
    hora_inicio: "07:30",
    hora_fin: "09:30",
    duracion_minutos: 60,
    prioridad: "Critica",
    dificultad: 5,
    nivel_estres: "Alto",
    justificacion_pedagogica: "Evaluación institucional fija inamovible.",
    descanso_posterior: true
  },

  // ==========================================
  // TAREAS PLANIFICADAS POR IA (dia_sugerido: fecha YYYY-MM-DD fija)
  // ==========================================
  {
    id: 4,
    tipo_actividad: "TAREA",
    nombre: "Refactorización de Navbar Inteligente",
    descripcion: "Materia: Modelamiento de Software. Acción: Corregir animación elástica en teléfonos usando max-w y opacidad en Tailwind.",
    dia_sugerido: ["2026-06-20"], // Jueves (Acomodado por la IA en un hueco libre)
    hora_inicio: "14:00",
    hora_fin: "16:30",
    duracion_minutos: 150,
    prioridad: "Alta",
    dificultad: 3,
    nivel_estres: "Moderado",
    justificacion_pedagogica: "Ubicado el jueves por la tarde tras tu reunión de proyecto y antes del entrenamiento de fútbol.",
    descanso_posterior: false
  },
  {
    id: 5,
    tipo_actividad: "TAREA",
    nombre: "Diseño del modelo Entidad-Relación",
    descripcion: "Materia: Bases de Datos. Acción: Normalización de tablas (1FN, 2FN, 3FN) para el sistema de transporte.",
    dia_sugerido: ["2026-06-19"], // Viernes (Asignado por la IA)
    hora_inicio: "08:30",
    hora_fin: "12:30",
    duracion_minutos: 240,
    prioridad: "Alta",
    dificultad: 4,
    nivel_estres: "Alto",
    justificacion_pedagogica: "Bloque largo de Deep Work asignado el viernes por la mañana para trabajar con máxima concentración.",
    descanso_posterior: true
  }
];



export default actividadesEstrategiaFinalBD;


