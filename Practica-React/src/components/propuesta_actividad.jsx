import React from 'react';

function PropuestaActividad({ isOpen, actividad, onConfirmar, onCancelar }) {
    if (!isOpen || !actividad) return null;
    
    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl shadow-indigo-500/10 animate-fade-in">

                {/* Encabezado del Modal */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="text-xl">🤖</span>
                <div>
                    <h3 className="text-sm font-bold text-slate-200">¡Optimización Completada!</h3>
                    <p className="text-[10px] text-indigo-400 font-medium">Propuesta de Distribución de la IA</p>
                </div>
                </div>
        
                {/* Cuerpo con los datos específicos extraídos */}
                <div className="space-y-3 text-xs">
                <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Actividad</span>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">{actividad.nombre}</p>
                    {actividad.descripcion && (
                    <p className="text-slate-400 text-[11px] mt-1 bg-slate-950/40 p-2 rounded-lg border border-white/5">
                        {actividad.descripcion}
                    </p>
                    )}
                </div>
                
                {/* Bloque del Horario Sugerido */}
                <div className="bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-slate-200">
                    <span className="font-medium text-slate-400">📅 Fecha sugerida:</span>
                    <span className="font-bold text-indigo-400">{actividad.dia_sugerido}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-200">
                    <span className="font-medium text-slate-400">⏱️ Horario asignado:</span>
                    <span className="font-bold text-indigo-400">{actividad.hora_inicio} - {actividad.hora_fin}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-200 border-t border-indigo-500/10 pt-1.5 text-[11px]">
                    <span className="text-slate-400">Duración total:</span>
                    <span className="font-mono bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300">
                        {actividad.duracion_minutos} min
                    </span>
                    </div>
                </div>
                
                {/* Variables de Carga e Impacto Inferidas por la IA */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-white/2 p-2 rounded-xl border border-white/5">
                    <div>
                    <p className="text-slate-500 font-medium text-[10px] uppercase">Prioridad</p>
                    <p className="font-semibold text-slate-300 mt-0.5">{actividad.prioridad || 'N/A'}</p>
                    </div>
                    <div>
                    <p className="text-slate-500 font-medium text-[10px] uppercase">Dificultad</p>
                    <p className="font-semibold text-slate-300 mt-0.5">⭐ {actividad.dificultad || 'N/A'}</p>
                    </div>
                    <div>
                    <p className="text-slate-500 font-medium text-[10px] uppercase">Estrés Mental</p>
                    <p className="font-semibold text-slate-300 mt-0.5">{actividad.nivel_estres || 'N/A'}</p>
                    </div>
                </div>
                
                {/* Justificación Pedagógica Contextual */}
                {actividad.justificacion_pedagogica && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                    💡 <strong>Justificación IA:</strong> {actividad.justificacion_pedagogica}
                    </div>
                )}
                </div>
            
                {/* Botones de control inferiores */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <button 
                    onClick={onCancelar} 
                    className="bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-2.5 rounded-xl transition-all"
                >
                    Rechazar Propuesta
                </button>
                <button 
                    onClick={onConfirmar} 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                >
                    Confirmar y Agendar
                </button>
                </div>
            </div>
        </div>
    );
}

export default PropuestaActividad