import { prisma } from '../config/db.js';
export const obtenerProgresoMensual = async (req, res) => {
    try {
        // 1. Extraer el ID del usuario autenticado desde el token
        const idUsuario = req.usuario?.id_usuario || req.usuario?.id;
        if (!idUsuario) {
            return res.status(401).json({ status: 'ERROR', message: 'Usuario no autenticado.' });
        }
        // 2. Obtener el periodo (Si no mandan ninguno, calculamos el mes actual en formato YYYY-MM)
        const { periodo } = req.query;
        let periodoBuscado = periodo;
        if (!periodoBuscado) {
            const ahoraEcuador = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" }));
            const anio = ahoraEcuador.getFullYear();
            const mes = String(ahoraEcuador.getMonth() + 1).padStart(2, '0');
            periodoBuscado = `${anio}-${mes}`; // Ej: "2026-07"
        }
        // 3. Consultar la tabla usando la clave compuesta id_usuario + periodo
        const metricaMensual = await prisma.historialMetricas.findUnique({
            where: {
                periodo_id_usuario: {
                    periodo: periodoBuscado,
                    id_usuario: idUsuario
                }
            }
        });
        // 4. Si es principio de mes o el usuario no tiene registros guardados aún, devolvemos una estructura limpia con ceros
        if (!metricaMensual) {
            return res.status(200).json({
                status: 'OK',
                periodo: periodoBuscado,
                metricas: {
                    horas_estudio: 0,
                    horas_libre_ganadas: 0,
                    tareas_completadas: 0
                }
            });
        }
        // 5. Enviar las métricas reales encontradas
        return res.status(200).json({
            status: 'OK',
            periodo: metricaMensual.periodo,
            metricas: {
                id_historial: metricaMensual.id_historial,
                horas_estudio: metricaMensual.horas_estudio,
                horas_libre_ganadas: metricaMensual.horas_libre_ganadas,
                tareas_completadas: metricaMensual.tareas_completadas
            }
        });
    }
    catch (error) {
        console.error('❌ Error al obtener el historial de métricas:', error);
        return res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor.' });
    }
};
