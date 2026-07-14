import { prisma } from '../config/db.js';
import { Resend } from 'resend';
// 1️⃣ Inicialización del SDK oficial de Resend (Inmune a bloqueos de puertos SMTP en Render)
const resend = new Resend(process.env.RESEND_API_KEY);
// Helper para verificar que la petición viene de nuestro cron autorizado
const validarSecretKey = (req) => {
    const authHeader = req.headers['authorization'];
    console.log("🔍 [DEBUG CRON] Header recibido:", authHeader);
    console.log("🔍 [DEBUG CRON] Clave esperada en .env:", process.env.CRON_SECRET_KEY);
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return false;
    const token = authHeader.split(' ')[1];
    return token === process.env.CRON_SECRET_KEY;
};
function calcularDiferenciaHoras(inicio, fin) {
    if (!inicio || !fin)
        return 0;
    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);
    const minutosInicio = hInicio * 60 + mInicio;
    const minutesFin = hFin * 60 + mFin;
    const diferenciaMinutos = minutesFin - minutosInicio;
    return diferenciaMinutos > 0 ? diferenciaMinutos / 60 : 0;
}
// 1️⃣ ENDPOINT DIARIO (Métricas + Limpieza) -> Se ejecutará a las 06:00 AM
export const ejecutarCronDiario = async (req, res) => {
    if (!validarSecretKey(req)) {
        return res.status(401).json({ status: 'ERROR', message: 'No autorizado.' });
    }
    // 🌟 RESPUESTA INMEDIATA: Evita timeouts en Postman y servicios de Cron Jobs externos
    res.status(200).json({ status: 'OK', message: 'Proceso de reportes iniciado en segundo plano.' });
    // Todo el proceso pesado corre de fondo de forma segura
    (async () => {
        console.log('=== 🚀 EJECUTANDO AUTOMATIZACIÓN DIARIA (MÉTRICAS) ===');
        const ahoraEcuador = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" }));
        const fechaHoyStr = `${ahoraEcuador.getFullYear()}-${String(ahoraEcuador.getMonth() + 1).padStart(2, '0')}-${String(ahoraEcuador.getDate()).padStart(2, '0')}`;
        const numeroDiaHoy = ahoraEcuador.getDay() === 0 ? 7 : ahoraEcuador.getDay();
        const numeroDiaHoyStr = String(numeroDiaHoy);
        const ayer = new Date(ahoraEcuador.getTime() - 24 * 60 * 60 * 1000);
        const fechaAyerStr = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;
        const periodoMensualStr = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}`;
        const numeroDiaAyer = ayer.getDay() === 0 ? 7 : ayer.getDay();
        const numeroDiaAyerStr = String(numeroDiaAyer);
        try {
            // ==========================================
            // PASO 1: ENVIAR REPORTE DIARIO CONSOLIDADO
            // ==========================================
            const usuariosConActividades = await prisma.usuario.findMany({
                include: {
                    actividades: {
                        where: {
                            OR: [
                                { dia_sugerido: { equals: fechaHoyStr } },
                                { dia_sugerido: { contains: numeroDiaHoyStr } }
                            ]
                        },
                        orderBy: { hora_inicio: 'asc' }
                    }
                }
            });
            const promesasReportes = usuariosConActividades.map((usuario) => {
                if (usuario.actividades.length === 0)
                    return Promise.resolve();
                const listaHTML = usuario.actividades.map(act => `
                    <li style="margin-bottom: 8px; font-family: sans-serif;">
                        <b>⏰ ${act.hora_inicio} a ${act.hora_fin}</b> - ${act.titulo} 
                        <span style="color: #6366f1; font-size: 12px;">(${act.categoria})</span>
                    </li>
                `).join('');
                // 📧 Envío mediante HTTP SDK de Resend
                return resend.emails.send({
                    from: 'Soporte Laboratorio <soporte@compraprogramadadg.com>',
                    to: usuario.id_usuario,
                    subject: `📋 Tu Agenda de Hoy - ${fechaHoyStr}`,
                    html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                        <h2>🌅 ¡Buenos días, ${usuario.nombre}!</h2>
                        <p>Aquí tienes tus actividades listas para hoy:</p>
                        <ul>${listaHTML}</ul>
                    </div>
                    `,
                })
                    .then(response => {
                    if (response.error)
                        console.error(`❌ Error de Resend en reporte matutino para ${usuario.id_usuario}:`, response.error.message);
                })
                    .catch(err => console.error(`❌ Error de red en reporte matutino para ${usuario.id_usuario}:`, err.message));
            });
            await Promise.all(promesasReportes);
            console.log('✉️ [CRON] Todos los reportes diarios procesados.');
            // ==========================================
            // PASO 2: PROCESAR MÉTRICAS HACIA HISTORIALMETRICAS
            // ==========================================
            const actividadesAyer = await prisma.actividad.findMany({
                where: {
                    OR: [
                        { dia_sugerido: { equals: fechaAyerStr } },
                        { dia_sugerido: { contains: numeroDiaAyerStr } }
                    ]
                }
            });
            if (actividadesAyer.length > 0) {
                console.log(`📊 Extrayendo métricas de ${actividadesAyer.length} actividades para el periodo: ${periodoMensualStr}`);
                const analisisUsuarios = {};
                actividadesAyer.forEach(act => {
                    const userId = act.id_usuario;
                    if (!analisisUsuarios[userId]) {
                        analisisUsuarios[userId] = { horasEstudio: 0, horasLibre: 8, completadas: 0 };
                    }
                    const duracion = act.duracion_minutos ? act.duracion_minutos : calcularDiferenciaHoras(act.hora_inicio, act.hora_fin);
                    const duracionEnHoras = duracion / 60;
                    analisisUsuarios[userId].horasEstudio += duracionEnHoras;
                    analisisUsuarios[userId].horasLibre -= duracionEnHoras;
                    analisisUsuarios[userId].completadas += 1;
                });
                for (const userId in analisisUsuarios) {
                    const metricaDia = analisisUsuarios[userId];
                    await prisma.historialMetricas.upsert({
                        where: {
                            periodo_id_usuario: {
                                periodo: periodoMensualStr,
                                id_usuario: userId
                            }
                        },
                        update: {
                            horas_estudio: { increment: metricaDia.horasEstudio },
                            horas_libre_ganadas: { increment: metricaDia.horasLibre },
                            tareas_completadas: { increment: metricaDia.completadas }
                        },
                        create: {
                            periodo: periodoMensualStr,
                            id_usuario: userId,
                            horas_estudio: metricaDia.horasEstudio,
                            horas_libre_ganadas: metricaDia.horasLibre,
                            tareas_completadas: metricaDia.completadas
                        }
                    });
                }
                console.log(`✅ Historial mensual (${periodoMensualStr}) actualizado correctamente.`);
            }
            // ==========================================
            // PASO 3: LIMPIEZA DE LA TABLA OPERATIVA
            // ==========================================
            const eliminadas = await prisma.actividad.deleteMany({
                where: { dia_sugerido: { equals: fechaAyerStr } }
            });
            const actualizarNotificado = await prisma.actividad.updateMany({
                where: { notificado: true },
                data: { notificado: false }
            });
            console.log(`🔄 Reset de notificaciones completado. Se actualizaron ${actualizarNotificado.count} registros.`);
            console.log(`🧹 Limpieza completada. Se eliminaron ${eliminadas.count} registros únicos.`);
            console.log('=== 🏁 CRON MATUTINO FINALIZADO SIN ERRORES ===');
        }
        catch (error) {
            console.error('❌ Error crítico en background de automatización diaria:', error.message);
        }
    })();
};
// 2️⃣ ENDPOINT FRECUENTE (Alertas de actividades cercanas) -> Se ejecutará cada 5 o 10 min
export const ejecutarCronAlertas = async (req, res) => {
    if (!validarSecretKey(req)) {
        return res.status(401).json({ status: 'ERROR', message: 'No autorizado.' });
    }
    // 🌟 RESPUESTA INMEDIATA: Evita ERR_HTTP_HEADERS_SENT y timeouts externos
    res.status(200).json({ status: 'OK', message: 'Proceso de alertas iniciado en segundo plano.' });
    (async () => {
        console.log('=== 🔔 REVISANDO ALERTAS Y RECORDATORIOS ===');
        try {
            const ahoraEcuador = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" }));
            const numeroDia = ahoraEcuador.getDay() === 0 ? 7 : ahoraEcuador.getDay();
            const numeroDiaStr = String(numeroDia);
            const anio = ahoraEcuador.getFullYear();
            const mes = String(ahoraEcuador.getMonth() + 1).padStart(2, '0');
            const dia = String(ahoraEcuador.getDate()).padStart(2, '0');
            const fechaHoyStr = `${anio}-${mes}-${dia}`;
            const horaActualStr = ahoraEcuador.toLocaleTimeString('es-EC', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            const enTreintaMinutos = new Date(ahoraEcuador.getTime() + 30 * 60000);
            const horaLimiteStr = enTreintaMinutos.toLocaleTimeString('es-EC', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            console.log(`📅 Fecha de hoy buscada en BD: "${fechaHoyStr}"`);
            console.log(`🕒 Rango de horas buscado: Desde [${horaActualStr}] Hasta [${horaLimiteStr}]`);
            const actividadesProximas = await prisma.actividad.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { dia_sugerido: { equals: fechaHoyStr } },
                                { dia_sugerido: { contains: numeroDiaStr } }
                            ]
                        },
                        {
                            hora_inicio: {
                                gte: horaActualStr,
                                lte: horaLimiteStr
                            }
                        },
                        {
                            notificado: false
                        }
                    ]
                },
                include: {
                    usuario: true
                }
            });
            if (actividadesProximas.length === 0) {
                console.log('✨ [Job] No hay actividades próximas en la siguiente media hora.');
                return;
            }
            const promesasCorreos = actividadesProximas.map((actividad) => {
                const usuario = actividad.usuario;
                if (!usuario)
                    return Promise.resolve();
                // 📧 Envío mediante HTTP SDK de Resend
                return resend.emails.send({
                    from: 'Soporte Laboratorio <soporte@compraprogramadadg.com>',
                    to: usuario.id_usuario,
                    subject: `⏰ Recordatorio: ${actividad.titulo} está por comenzar`,
                    html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                        <h2>🔔 ¡Hola, ${usuario.nombre}!</h2>
                        <p>Te recordamos que tienes una actividad programada pronto:</p>
                        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #6366f1; margin: 15px 0;">
                            <h3 style="margin-top: 0;">${actividad.titulo}</h3>
                            <p><b>⏰ Horario:</b> ${actividad.hora_inicio} - ${actividad.hora_fin}</p>
                            <p><b>📁 Categoría:</b> ${actividad.categoria}</p>
                            ${actividad.descripcion ? `<p><b>📝 Descripción:</b> ${actividad.descripcion}</p>` : ''}
                        </div>
                    </div>
                    `
                })
                    .then(async (response) => {
                    if (response.error) {
                        console.error(`❌ Error de Resend para ${usuario.id_usuario}:`, response.error.message);
                        return;
                    }
                    else {
                        await prisma.actividad.update({
                            where: { id_actividad: actividad.id_actividad },
                            data: { notificado: true }
                        });
                    }
                })
                    .catch(err => {
                    console.error(`❌ Error de red enviando alerta a ${usuario.id_usuario}:`, err.message);
                });
            });
            await Promise.all(promesasCorreos);
            console.log('✉️ [CRON] Todas las alertas de proximidad despachadas.');
        }
        catch (error) {
            console.error('❌ Error crítico en background de envío de alertas:', error.message);
        }
    })();
};
