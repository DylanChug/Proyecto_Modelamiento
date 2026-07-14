import React from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom'; 
function ModalReoptimizar({ isOpen, agendaReoptimizada, onClose, onExito }) {
  // Si el modal está configurado para cerrarse o no hay datos de la IA, no dibuja nada
    if (!isOpen || !agendaReoptimizada) return null;

    const Servidor_Backend = import.meta.env.VITE_SERVIDOR_BACKEND || "http://localhost:3000";

    const guardarCambiosMasivos = async () => {
    try {
        const token = localStorage.getItem("token_user");
    
        // Enviamos el arreglo con el efecto dominó al endpoint de confirmación masiva
        const respuesta = await axios.post(`${Servidor_Backend}/api/optimizacion/confirmar-reoptimizacion`, {
        actividades_actualizadas: agendaReoptimizada
        }, {
        headers: { 'Authorization': `Bearer ${token}` }
        });
    
        if (respuesta.data.status === 'OK') {
        alert("🤖 SmartIA: ¡Efecto dominó aplicado! Tu calendario ha sido reorganizado.");
        if (onExito) onExito(); // Refresca las actividades en el componente padre
        onClose(); // Cierra el modal
        }
    } catch (error) {
        console.error("Error al guardar la re-optimización masiva:", error);
        alert("Hubo un error al aplicar los cambios en la base de datos.");
    }
    };

    const Modal = (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl shadow-indigo-500/5 animate-in fade-in zoom-in-95 duration-150">
        
        <div>
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            🔄 Reorganización en Cadena Detectada
            </h3>
            <p className="text-xs text-slate-400 mt-1">
            Al no haber espacio suficiente, la IA ha tenido que desplazar tus tareas flexibles para evitar colisiones con tus rutinas o eventos fijos.
            </p>
        </div>

        {/* Lista de cambios en cadena */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {agendaReoptimizada.map((act) => (
            <div key={act.id_actividad || act.id} className="bg-slate-950/50 p-3 rounded-xl border border-white/5 text-xs">
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>📋 {act.nombre}</span>
                <span className="text-indigo-400 font-medium">Nueva posición ⏱️</span>
                </div>
                <p className="text-slate-400">📅 Fecha: <span className="text-indigo-300 font-semibold">{act.dia_sugerido}</span></p>
                <p className="text-slate-400">🕒 Horario: <span className="text-indigo-300 font-semibold">{act.hora_inicio} - {act.hora_fin}</span></p>
                {act.justificacion_pedagogica && (
                <p className="text-[11px] text-emerald-400/90 italic mt-1 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
                    💡 {act.justificacion_pedagogica}
                </p>
                )}
            </div>
            ))}
        </div>
        
        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <button 
            onClick={onClose} 
            className="bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-2.5 rounded-xl transition-all"
            >
            Descartar Cambios
            </button>
            <button 
            onClick={guardarCambiosMasivos} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
            Aceptar Reordenamiento
            </button>
        </div>
        
        </div>
    </div>
    );
    return ReactDOM.createPortal(Modal, document.body);
}
export default ModalReoptimizar;