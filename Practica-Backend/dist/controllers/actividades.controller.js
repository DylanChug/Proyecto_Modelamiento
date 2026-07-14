import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// 1. OBTENER ACTIVIDADES (GET)
export const obtenerActividades = async (req, res) => {
    try {
        // 1. Obtener el ID del usuario autenticado desde el token
        const emailOIdUsuario = req.usuario?.id_usuario || req.usuario?.id || req.usuario?.email;
        if (!emailOIdUsuario) {
            return res.status(401).json({ status: 'ERROR', message: 'No autorizado.' });
        }
        // 2. Traer las actividades crudas de la Base de Datos (MySQL / Railway)
        const actividadesBD = await prisma.actividad.findMany({
            where: { id_usuario: emailOIdUsuario }
        });
        // 3. 🔄 EL TRADUCTOR INVERSO: Mapeamos los campos al formato del Frontend
        const actividadesParaFront = actividadesBD.map((act) => {
            // Manejo de dia_sugerido:
            // Si en la BD se guardó como string "2, 4", lo convertimos en un arreglo de números [2, 4]
            // Si venía una fecha string como "2026-07-06", lo dejamos como un arreglo de texto ["2026-07-06"]
            let diasFormateados = [];
            if (act.dia_sugerido) {
                diasFormateados = act.dia_sugerido.split(', ').map(dia => {
                    // Si es un número puro (como "2" o "4"), lo convertimos a Number, si no lo dejamos como String
                    return !isNaN(Number(dia)) ? Number(dia) : dia;
                });
            }
            return {
                id: act.id_actividad, // id_actividad ➡️ id
                tipo_actividad: act.categoria, // categoria ➡️ tipo_actividad
                nombre: act.titulo, // titulo ➡️ nombre
                descripcion: act.descripcion, // Mismo nombre
                dia_sugerido: diasFormateados, // String ("2, 4") ➡️ Array ([2, 4])
                hora_inicio: act.hora_inicio, // Mismo nombre
                hora_fin: act.hora_fin, // Mismo nombre
                duracion_minutos: act.duracion_minutos, // Mismo nombre
                prioridad: act.prioridad, // Mismo nombre
                dificultad: act.dificultad, // Mismo nombre
                nivel_estres: act.nivel_estres, // Mismo nombre
                justificacion_pedagogica: act.justificacion_pedagogica, // Mismo nombre
                descanso_posterior: act.descanso_posterior // Mismo nombre
            };
        });
        // 4. Enviamos la respuesta con la estructura que el Front ya sabe leer
        return res.status(200).json({
            status: 'OK',
            actividades: actividadesParaFront
        });
    }
    catch (error) {
        console.error("Error al obtener y mapear actividades:", error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno en el servidor al procesar las actividades.'
        });
    }
};
// 2. CREAR ACTIVIDAD (POST) - Soporta Tareas de IA, Rutinas y Eventos
export const crearActividad = async (req, res) => {
    try {
        const emailOIdUsuario = req.usuario.id_usuario;
        if (!emailOIdUsuario) {
            return res.status(401).json({ status: 'ERROR', message: 'Sesión inválida.' });
        }
        // Mapeamos lo que manda el formulario de React a lo que pide tu esquema de Prisma
        const { nombre, titulo, descripcion, tipo_actividad, // Se puede mapear a 'categoria' si es lo que usas en el modelo
        dia_sugerido, // El front manda un array, lo convertiremos a String para cumplir con @db.Text
        hora_inicio, hora_fin, duracion_minutos, prioridad, dificultad, nivel_estres, justificacion_pedagogica, descanso_posterior } = req.body;
        // Procesamos el dia_sugerido para que no rompa el tipo String de Prisma
        // Si viene como array ["2026-07-06"] o [1, 2], lo unimos por comas o stringificamos
        const diaSugeridoString = Array.isArray(dia_sugerido)
            ? dia_sugerido.join(', ')
            : (dia_sugerido || '').toString();
        // El front para TAREAS manda la fecha límite en dia_sugerido[0]. Lo usamos para 'fecha_entrega'
        let fechaEntregaISO = new Date();
        if (Array.isArray(dia_sugerido) && dia_sugerido[0] && typeof dia_sugerido[0] === 'string' && dia_sugerido[0].includes('-')) {
            fechaEntregaISO = new Date(dia_sugerido[0]);
        }
        const nuevaActividad = await prisma.actividad.create({
            data: {
                titulo: titulo || nombre || 'Nueva Actividad',
                descripcion: descripcion || null,
                categoria: tipo_actividad || 'TAREA', // Mapeamos el tipo a tu columna 'categoria'
                estado: 'Pendiente',
                dia_sugerido: diaSugeridoString,
                hora_inicio: hora_inicio || '00:00',
                hora_fin: hora_fin || '00:00',
                duracion_minutos: duracion_minutos ? Number(duracion_minutos) : 0,
                fecha_entrega: fechaEntregaISO,
                prioridad: prioridad || 'Media',
                dificultad: dificultad ? parseInt(dificultad) : 1,
                nivel_estres: nivel_estres || 'Ligero',
                justificacion_pedagogica: justificacion_pedagogica || null,
                descanso_posterior: descanso_posterior || false,
                // Conexión relacional limpia usando el ID del usuario logueado
                usuario: {
                    connect: { id_usuario: emailOIdUsuario }
                }
            }
        });
        let diasFormateados = [];
        if (nuevaActividad.dia_sugerido) {
            diasFormateados = nuevaActividad.dia_sugerido.split(', ').map(dia => {
                return !isNaN(Number(dia)) ? Number(dia) : dia;
            });
        }
        // 3. Mapeamos la estructura exacta que tu frontend espera recibir
        const nuevaActividadParaFront = {
            id: nuevaActividad.id_actividad, // id_actividad ➡️ id ✅
            tipo_actividad: nuevaActividad.categoria, // categoria ➡️ tipo_actividad
            nombre: nuevaActividad.titulo, // titulo ➡️ nombre
            descripcion: nuevaActividad.descripcion,
            dia_sugerido: diasFormateados, // String ➡️ Array para tu estado
            hora_inicio: nuevaActividad.hora_inicio,
            hora_fin: nuevaActividad.hora_fin,
            duracion_minutos: nuevaActividad.duracion_minutos,
            prioridad: nuevaActividad.prioridad,
            dificultad: nuevaActividad.dificultad,
            nivel_estres: nuevaActividad.nivel_estres,
            justificacion_pedagogica: nuevaActividad.justificacion_pedagogica,
            descanso_posterior: nuevaActividad.descanso_posterior
        };
        return res.status(201).json({
            status: 'OK',
            message: 'Actividad guardada perfectamente.',
            actividad: nuevaActividadParaFront
        });
    }
    catch (error) {
        console.error("Error al crear actividad con Prisma:", error);
        return res.status(500).json({ status: 'ERROR', message: 'Error interno en el servidor.' });
    }
};
// 3. ACTUALIZAR ACTIVIDAD (PUT)
export const actualizarActividad = async (req, res) => {
    try {
        const emailOIdUsuario = req.usuario?.id_usuario || req.usuario?.id || req.usuario?.email;
        // Recibimos id o id_actividad desde el cuerpo
        const { id, id_actividad, nombre, titulo, descripcion, tipo_actividad, dia_sugerido, hora_inicio, hora_fin, duracion_minutos, prioridad, dificultad, nivel_estres, descanso_posterior, justificacion_pedagogica } = req.body;
        const targetId = Number(id_actividad || id);
        if (!targetId) {
            return res.status(400).json({ status: 'ERROR', message: 'ID de actividad requerido.' });
        }
        // Validar pertenencia antes de modificar
        const dueño = await prisma.actividad.findFirst({
            where: {
                id_actividad: targetId,
                id_usuario: emailOIdUsuario
            }
        });
        if (!dueño) {
            return res.status(403).json({ status: 'ERROR', message: 'No tienes permiso para modificar esta actividad.' });
        }
        const diaSugeridoString = Array.isArray(dia_sugerido)
            ? dia_sugerido.join(', ')
            : (dia_sugerido || '').toString();
        let fechaEntregaISO = dueño.fecha_entrega;
        if (Array.isArray(dia_sugerido) && dia_sugerido[0] && typeof dia_sugerido[0] === 'string' && dia_sugerido[0].includes('-')) {
            fechaEntregaISO = new Date(dia_sugerido[0]);
        }
        const actividadActualizada = await prisma.actividad.update({
            where: { id_actividad: targetId },
            data: {
                id_actividad: id,
                titulo: titulo || nombre,
                descripcion: descripcion || null,
                categoria: tipo_actividad,
                dia_sugerido: diaSugeridoString,
                hora_inicio: hora_inicio,
                hora_fin: hora_fin,
                duracion_minutos: duracion_minutos ? Number(duracion_minutos) : undefined,
                fecha_entrega: fechaEntregaISO,
                prioridad: prioridad,
                dificultad: dificultad ? Number(dificultad) : undefined,
                nivel_estres: nivel_estres,
                justificacion_pedagogica: justificacion_pedagogica || null,
                descanso_posterior: descanso_posterior
            }
        });
        // Manejo de dia_sugerido:
        // Si en la BD se guardó como string "2, 4", lo convertimos en un arreglo de números [2, 4]
        // Si venía una fecha string como "2026-07-06", lo dejamos como un arreglo de texto ["2026-07-06"]
        let diasFormateados = [];
        if (actividadActualizada.dia_sugerido) {
            diasFormateados = actividadActualizada.dia_sugerido.split(', ').map(dia => {
                return !isNaN(Number(dia)) ? Number(dia) : dia;
            });
        }
        // 3. Mapeamos la estructura exacta que tu frontend espera recibir
        const actividadActualizadaParaFront = {
            id: actividadActualizada.id_actividad, // id_actividad ➡️ id ✅
            tipo_actividad: actividadActualizada.categoria, // categoria ➡️ tipo_actividad
            nombre: actividadActualizada.titulo, // titulo ➡️ nombre
            descripcion: actividadActualizada.descripcion,
            dia_sugerido: diasFormateados, // String ➡️ Array para tu estado
            hora_inicio: actividadActualizada.hora_inicio,
            hora_fin: actividadActualizada.hora_fin,
            duracion_minutos: actividadActualizada.duracion_minutos,
            prioridad: actividadActualizada.prioridad,
            dificultad: actividadActualizada.dificultad,
            nivel_estres: actividadActualizada.nivel_estres,
            justificacion_pedagogica: actividadActualizada.justificacion_pedagogica,
            descanso_posterior: actividadActualizada.descanso_posterior
        };
        return res.status(200).json({
            status: 'OK',
            message: 'Actividad actualizada perfectamente.',
            actividad: actividadActualizadaParaFront
        });
    }
    catch (error) {
        console.error("Error al actualizar actividad con Prisma:", error);
        return res.status(500).json({ status: 'ERROR', message: 'Error interno en el servidor.' });
    }
};
// 4. ELIMINAR ACTIVIDAD (DELETE)
export const eliminarActividad = async (req, res) => {
    try {
        const emailOIdUsuario = req.usuario?.id_usuario || req.usuario?.id || req.usuario?.email;
        if (!emailOIdUsuario) {
            return res.status(401).json({ status: 'ERROR', message: 'Sesión inválida.' });
        }
        // Capturamos el id de los parámetros de la URL (ej: /api/actividades/eliminar/15)
        const { id_actividad } = req.params;
        const targetId = Number(id_actividad);
        if (!targetId) {
            return res.status(400).json({ status: 'ERROR', message: 'ID de actividad inválido o ausente.' });
        }
        // 🔒 Control de Seguridad: Verificar que la actividad exista y sea del usuario logueado
        const actividadExistente = await prisma.actividad.findFirst({
            where: {
                id_actividad: targetId,
                id_usuario: emailOIdUsuario
            }
        });
        if (!actividadExistente) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'La actividad no existe o no tienes autorización para eliminarla.'
            });
        }
        // Procedemos al borrado físico en la BD
        await prisma.actividad.delete({
            where: { id_actividad: targetId }
        });
        return res.status(200).json({
            status: 'OK',
            message: 'Actividad eliminada exitosamente.'
        });
    }
    catch (error) {
        console.error("Error al eliminar actividad con Prisma:", error);
        return res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor.' });
    }
};
