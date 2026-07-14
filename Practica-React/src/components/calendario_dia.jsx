import react from 'react';
import Actividad from './actvidad.jsx'; // Conservando tu nombre de archivo exacto

function CalendarioDia({ actividades, semana }) {
    const [actividadSeleccionada, setActividadSeleccionada] = react.useState(null);
    
    // 1. GENERADOR DE DÍAS (Agregamos "numeroDiaSemana" para cruzar con las rutinas)
    const generarDiasFiltro = (fechaBaseStr) => {
        const [año, mes, dia] = fechaBaseStr.split('-').map(Number);
        const diasGenerados = [];
        
        const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        for (let i = 0; i < 7; i++) {
            const fechaVariante = new Date(Date.UTC(año, mes - 1, dia, 12, 0, 0));
            fechaVariante.setUTCDate(fechaVariante.getUTCDate() + i);
            
            const stringFecha = fechaVariante.toISOString().split('T')[0];
            const numeroDiaSemana = fechaVariante.getUTCDay();

            diasGenerados.push({
                fechaString: stringFecha,                          // ej: "2026-06-16"
                nombre: i === 0 ? 'Hoy' : nombresDias[numeroDiaSemana], // El primero dice 'Hoy'
                labelFecha: fechaVariante.getUTCDate(),            // ej: 16
                numeroDiaSemana: numeroDiaSemana                   // 💡 Agregado: (0 = Dom, 1 = Lun...)
            });
        }
        return diasGenerados;
    };

    const mis7DiasVisuales = generarDiasFiltro(semana);

    // 💡 2. PRE-FILTRADO DE LA SEMANA ADAPTADO A ARREGLOS
    const actividadesDeLaSemana = actividades.filter((act) => {
        if (!act.dia_sugerido || !Array.isArray(act.dia_sugerido) || act.dia_sugerido.length === 0) return false;

        // Si el primer elemento no contiene un guion "-", asumimos que es una rutina numérica, pasa directo
        if (typeof act.dia_sugerido[0] === 'number' || !act.dia_sugerido[0].includes("-")) return true;

        // Si es una tarea (tiene fecha string), validamos si cae dentro de alguno de los 7 días visuales
        return mis7DiasVisuales.some(diaVis => act.dia_sugerido.includes(diaVis.fechaString));
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 bg-transparent rounded-2xl border border-white/5">
            {mis7DiasVisuales.map((Dia) => {
                
                // 💡 3. EMPAREJAR ACTIVIDADES (REVISANDO ADENTRO DEL ARREGLO)
                const actividadesDelDia = actividadesDeLaSemana.filter((act) => {
                    
                    // Caso A: Rutinas o Clases Fijas (Arreglo de números como [1, 3, 5])
                    if (typeof act.dia_sugerido[0] === 'number' || !act.dia_sugerido[0].includes("-")) {
                        // Pasamos el índice de JS (0=Dom, 1=Lun) a tu formato (1=Lun, 7=Dom)
                        let idDiaSemana = Dia.numeroDiaSemana;
                        if (idDiaSemana === 0) idDiaSemana = 7; 
                        
                        // Validamos si el número de este día de la columna está dentro del array de la rutina
                        return act.dia_sugerido.map(Number).includes(idDiaSemana);
                    }
                    
                    // Caso B: Tareas (Arreglo de fechas string como ["2026-06-18"])
                    return act.dia_sugerido.includes(Dia.fechaString);
                });  
                
                // Ordenamos cronológicamente por hora de inicio
                actividadesDelDia.sort((a, b) => {
                    const horaA = a.hora_inicio || a.hora_fin || "";
                    const horaB = b.hora_inicio || b.hora_fin || "";
                    return horaA.localeCompare(horaB);
                });

                return (
                    <div key={Dia.fechaString} className="flex flex-col bg-black/25 border border-white/5 p-3 rounded-xl min-h-62">
                        <div className="text-center border-b border-white/5 pb-2 mb-3">
                            <h3 className="text-sm font-bold text-slate-300">{Dia.nombre}</h3>
                            <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                                {Dia.labelFecha}
                            </span>
                        </div>
                        
                        <div className="space-y-2.5 flex-1 overflow-y-auto">
                            {actividadesDelDia.length > 0 ? (
                                actividadesDelDia.map((actividad) => (
                                    <div 
                                        key={actividad.id} 
                                        onClick={() => setActividadSeleccionada(actividad)}
                                        className="cursor-pointer transition-transform active:scale-95"
                                    >
                                        <Actividad actividad={actividad} />
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center py-8 border border-dashed border-white/5 rounded-lg">
                                    <p className="text-[10px] text-slate-600 italic">Libre</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* =========================================================
                🔮 MODAL DETALLE EXPANDIDO
               ========================================================= */}
            {actividadSeleccionada && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all"
                    onClick={() => setActividadSeleccionada(null)} // 💡 Corregido: Un solo click para cerrar al dar al fondo
                >
                    <div 
                        className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transform transition-all ${
                            actividadSeleccionada.tipo_actividad === 'RUTINA' ? 'border-white/20 shadow-white/5 bg-slate-900' :
                            actividadSeleccionada.tipo_actividad === 'EVENTO' ? 'border-pink-500/20 shadow-pink-500/5 bg-slate-900' :
                            'border-indigo-500/20 shadow-indigo-500/5 bg-slate-900'
                        }`}
                        onClick={(e) => e.stopPropagation()} // Evita el cierre al clickear dentro del cuadro
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded ${
                                actividadSeleccionada.tipo_actividad === 'RUTINA' ? 'bg-slate-500/20 text-slate-300 border border-white/10' :
                                actividadSeleccionada.tipo_actividad === 'EVENTO' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                                {actividadSeleccionada.tipo_actividad}
                            </span>
                            <button 
                                className="text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors"
                                onClick={() => setActividadSeleccionada(null)}
                            >
                                ✕ Cerrar
                            </button>
                        </div>

                        {/* Contenido */}
                        <h3 className="text-base font-bold text-slate-100 leading-snug">{actividadSeleccionada.nombre}</h3>
                        
                        {actividadSeleccionada.descripcion && (
                            <p className="text-xs text-slate-400 mt-3 p-3 bg-white/2 border border-white/5 rounded-xl whitespace-pre-wrap leading-relaxed">
                                {actividadSeleccionada.descripcion}
                            </p>
                        )}

                        {/* Horarios */}
                        <div className="mt-4 flex items-center gap-4 text-xs font-mono text-slate-400 bg-white/1 p-2.5 border border-white/5 rounded-xl">
                            <div>
                                ⏱️ Horario:{' '}
                                <span className="text-slate-200 font-semibold">
                                    {actividadSeleccionada.tipo_actividad === 'TAREA' 
                                        ? `Antes de las ${actividadSeleccionada.hora_fin}` 
                                        : `${actividadSeleccionada.hora_inicio} - ${actividadSeleccionada.hora_fin}`
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Justificación de la IA */}
                        {actividadSeleccionada.justificacion_pedagogica && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <span className="text-[10px] font-bold tracking-wider text-indigo-400 block mb-1 uppercase">✨ Sugerencia de Optimización IA:</span>
                                <p className="text-xs italic text-slate-400 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 leading-relaxed">
                                    "{actividadSeleccionada.justificacion_pedagogica}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CalendarioDia;