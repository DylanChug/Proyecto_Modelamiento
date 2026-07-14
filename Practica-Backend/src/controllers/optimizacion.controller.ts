import { Response } from 'express';
import { Actividad, PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/auth.middleware.js';
import { consultarIAOptimizar, consultarIAReoptimizar } from '../services/gemini.services.js';

const prisma = new PrismaClient();

// Función rápida para neutralizar intentos comunes de inyección
const sanitizarDirectrices = (texto: string | null | undefined): string => {
    if (!texto) return "";

    // 1. Limitar la longitud para evitar ataques de desbordamiento de contexto (DDoS al modelo)
    let textoLimpio = texto.substring(0, 500); 

    // 2. Lista negra de palabras sospechosas (las volvemos inofensivas)
    const palabrasProhibidas = [
    /ignore previous instructions/gi,
    /olvida las instrucciones anteriores/gi,
    /system prompt/gi,
    /eres un nuevo modelo/gi,
    /tú ya no eres/gi
    ];

    palabrasProhibidas.forEach(regex => {
    textoLimpio = textoLimpio.replace(regex, "[REDACTADO POR SEGURIDAD]");
    });

    return textoLimpio;
};

// 1. GENERAR PROPUESTA OPTIMIZADA (POST)
export const generarPropuestaOptimizada = async (req: RequestConUsuario, res: Response) => {
        try {
        const idUsuario = req.usuario?.id_usuario || req.usuario?.id || req.usuario?.email;
    
        if (!idUsuario) {
            return res.status(401).json({ status: 'ERROR', message: 'Sesión inválida.' });
        }
    
        // El front envía los datos básicos ingresados en el formulario
        const { titulo, descripcion, duracion_minutos, prioridad, dificultad } = req.body;
    
        if (!titulo || !duracion_minutos) {
            return res.status(400).json({ status: 'ERROR', message: 'El título y la duración son obligatorios.' });
        }
    
        // 1. Buscamos todas tus actividades actuales en Railway para que la IA sepa cuándo estás ocupado
        // 1. Obtener las actividades existentes para el control de colisiones de horarios
    const agendaActual = await prisma.actividad.findMany({
        where: { id_usuario: idUsuario },
        select: {
            titulo: true,
            categoria: true,
            dia_sugerido: true,
            hora_inicio: true,
            hora_fin: true,
            nivel_estres: true
        }
    });

    // 2. Buscar la configuración de la IA usando tu columna 'usuarioId'
    // Reemplaza 'configuracionIA' por el nombre exacto de tu modelo en tu schema.prisma
    const configIA = await prisma.configuracion.findUnique({
        where: { usuarioId: idUsuario }
    });

    // 3. Preparar las reglas del usuario formateando los JSON si existen
    const reglasUsuario = {
        ordenes_ia: sanitizarDirectrices(configIA?.ordenes_ia || "") || "Planifica de forma equilibrada.",
        nivel_estricto_ia: configIA?.nivel_estricto_ia || "moderado",
        hora_sueno_inicio: configIA?.hora_sueno_inicio || "23:00",
        hora_sueno_fin: configIA?.hora_sueno_fin || "06:30",
        // Si bloques_energia tiene datos, lo parseamos para que la IA lea el objeto limpio
        bloques_energia: configIA?.bloques_energia ? JSON.parse(configIA.bloques_energia) : {}
    };

    // 4. Empaquetamos todo el contexto para el servicio de Gemini
    const contextoIA = {
        tareaAProgramar: { 
            titulo, 
            descripcion: descripcion || '', 
            duracion_minutos: Number(duracion_minutos), 
            prioridad: prioridad || 'Media', 
            dificultad: dificultad ? Number(dificultad) : 2 
        },
        agendaOcupada: agendaActual,
        reglasUsuario
    };
    
        // 3. Le pedimos a Gemini que calcule el espacio libre
        const propuestaIA = await consultarIAOptimizar(contextoIA);
    
        // 4. Respondemos al frente
        return res.status(200).json({
            status: 'OK',
            propuesta: propuestaIA
        });
    
        } catch (error) {
        console.error("Error en el motor de optimización:", error);
        return res.status(500).json({ status: 'ERROR', message: 'No se pudo generar la propuesta con la IA.' });
        }
    };

// 2. RE-OPTIMIZAR AGENDA SEMANAL (POST)
export const reoptimizarAgendaSemanal = async (req: RequestConUsuario, res: Response) => {
    try {
        const idUsuario = req.usuario?.id_usuario || req.usuario?.id || req.usuario?.email;
    
        if (!idUsuario) {
        return res.status(401).json({ status: 'ERROR', message: 'Sesión inválida.' });
        }
    
        const ahora = new Date();
    
        // 1. Traer TODAS las actividades que falten por cumplir en la semana
        const todasLasActividades = await prisma.actividad.findMany({
        where: { 
            id_usuario: idUsuario,
            // Filtramos para traer solo eventos de hoy en adelante
            dia_sugerido: { gte: ahora.toISOString().split('T')[0] } 
        },
        select: {
            id_actividad: true, // Lo necesitamos para saber cuál es cuál al regresar
            titulo: true,
            categoria: true,
            dia_sugerido: true,
            hora_inicio: true,
            hora_fin: true,
            nivel_estres: true,
            duracion_minutos: true,
            prioridad: true,
            dificultad: true
        }
        });
    
        // 2. Traer la configuración del usuario (sueño, directrices, energía)
        const configIA = await prisma.configuracion.findUnique({
        where: { usuarioId: idUsuario }
        });
    
        const reglasUsuario = {
        ordenes_ia: sanitizarDirectrices(configIA?.ordenes_ia), 
        nivel_estricto_ia: configIA?.nivel_estricto_ia || "moderado",
        hora_sueno_inicio: configIA?.hora_sueno_inicio || "23:00",
        hora_sueno_fin: configIA?.hora_sueno_fin || "06:30",
        bloques_energia: configIA?.bloques_energia ? JSON.parse(configIA.bloques_energia) : {}
        };
    
        // 3. Preparar el paquete de datos para Gemini
        const contextoIA = {
        fecha_actual: ahora.toISOString().split('T')[0],
        hora_actual: `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`,
        actividadesActuales: todasLasActividades,
        reglasUsuario
        };
    
        // 4. Llamar al servicio especializado de re-optimización
        const nuevaAgendaPropuesta = await consultarIAReoptimizar(contextoIA);
        
    const actividadesParaFront = nuevaAgendaPropuesta.map((act: Actividad) => {
        // Manejo de dia_sugerido:
        // Si en la BD se guardó como string "2, 4", lo convertimos en un arreglo de números [2, 4]
        // Si venía una fecha string como "2026-07-06", lo dejamos como un arreglo de texto ["2026-07-06"]
        let diasFormateados: (string | number)[] = [];
        if (act.dia_sugerido) {
        diasFormateados = act.dia_sugerido.split(', ').map(dia => {
          // Si es un número puro (como "2" o "4"), lo convertimos a Number, si no lo dejamos como String
            return !isNaN(Number(dia)) ? Number(dia) : dia;
            });
        }
        return {
            id: act.id_actividad,                           // id_actividad ➡️ id
            nombre: act.titulo,                             // titulo ➡️ nombre
            dia_sugerido: diasFormateados,                  // String ("2, 4") ➡️ Array ([2, 4])
            hora_inicio: act.hora_inicio,                   // Mismo nombre
            hora_fin: act.hora_fin,                         // Mismo nombre
            duracion_minutos: act.duracion_minutos,         // Mismo nombre
            prioridad: act.prioridad,                       // Mismo nombre
            dificultad: act.dificultad,                     // Mismo nombre
            nivel_estres: act.nivel_estres,                 // Mismo nombre
            justificacion_pedagogica: act.justificacion_pedagogica, // Mismo nombre
            descanso_posterior: act.descanso_posterior      // Mismo nombre
        };
    });
            return res.status(200).json({
            status: 'OK',
            agenda_reoptimizada: actividadesParaFront
            });
    
    } catch (error) {
        console.error("Error en la re-optimización dinámica:", error);
        return res.status(500).json({ status: 'ERROR', message: 'No se pudo re-optimizar la agenda.' });
    }
};

// 3. CONFIRMAR RE-OPTIMIZACIÓN MASIVA (POST)
export const confirmarReoptimizacionMasiva = async (req: RequestConUsuario, res: Response) => {
  try {
    const idUsuario = req.usuario?.id_usuario || req.usuario?.id || req.usuario?.email;
    
        if (!idUsuario) {
            return res.status(401).json({ status: 'ERROR', message: 'Sesión inválida.' });
        }
    // 1. Recibimos el arreglo de actividades que mandó el Modal desde el Front
    const { actividades_actualizadas } = req.body;

    if (!actividades_actualizadas || !Array.isArray(actividades_actualizadas)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'El formato de las actividades actualizadas no es válido.'
      });
    }

    // 2. 🚀 Creamos una transacción masiva de Prisma
    // Mapeamos cada actividad sugerida por la IA a una promesa de actualización
    const operacionesUpdate = actividades_actualizadas.map((act) => {
      
      // Si en el front mapeaste 'dia_sugerido' como Array, 
      // lo volvemos a unir como un string ("2, 4" o "2026-07-06") para guardarlo en Prisma
      const diaParaBD = Array.isArray(act.dia_sugerido) 
        ? act.dia_sugerido.join(', ') 
        : String(act.dia_sugerido);

      return prisma.actividad.update({
        where: {
            id_actividad: Number(act.id),
            id_usuario: idUsuario // 👈 Buscamos por el ID original
        },
        data: {
          dia_sugerido: diaParaBD,
          hora_inicio: act.hora_inicio,
          hora_fin: act.hora_fin,
          justificacion_pedagogica: act.justificacion_pedagogica
        }
      });
    });

    // 3. 🔥 Se ejecutan todos los updates en bloque en la base de datos
    await prisma.$transaction(operacionesUpdate);

    return res.status(200).json({
      status: 'OK',
      message: '¡Efecto dominó aplicado con éxito en la base de datos!'
    });

  } catch (error) {
    console.error('Error crítico en la actualización masiva:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'No se pudo guardar la reorganización masiva de la agenda.'
    });
  }
};