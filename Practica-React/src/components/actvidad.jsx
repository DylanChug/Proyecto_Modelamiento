import React from "react";
import obtenerNombreDia from "../utils/formato_fecha.js";
function Actividad({ actividad }) {
    const Dia = obtenerNombreDia(actividad.dia_sugerido);
    
    const MAPEO_COLORES_TIPO = {
        RUTINA: "bg-slate-500/50 border-slate-500/20 text-white hover:bg-slate-500/15",
        EVENTO: "bg-black/50 border-black/30 text-pink-400 hover:bg-black/20",
        TAREA: "bg-blue-500/50 border-blue-500/30 text-green-400 hover:bg-blue-500/20"
    };
    return (
        <div className={`m-4 p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-pointer ${MAPEO_COLORES_TIPO[actividad.tipo_actividad]}`}>
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[8px] uppercase tracking-wider font-bold opacity-90">
                {actividad.tipo_actividad}
                </span>
                {actividad.prioridad === "Critica" && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
            </div>

            <h4 className="text-xs font-bold leading-tight line-clamp-2">{actividad.nombre}</h4>
            <p className="text-[10px] font-medium font-mono mt-2 opacity-80">
                {actividad.hora_inicio} - {actividad.hora_fin}
            </p>

            {actividad.tipo_actividad === "TAREA" && actividad.nivel_estres && (
            <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-[9px] opacity-70">
                <span>Estrés: {actividad.nivel_estres}</span>
                <span>⚡ Dif: {actividad.dificultad}</span>
            </div>
            )}
        </div>
    );
}

export default Actividad;