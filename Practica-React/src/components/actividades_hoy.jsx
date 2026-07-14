import React from "react";
import Actividad from "./actvidad.jsx";
function ActividadHoy({actividades}){
    
    // 💡 1. Obtener la fecha de hoy en formato local YYYY-MM-DD
const obtenerFechaHoy = () => {
    const hoy = new Date();
    const hoyString = hoy.toLocaleDateString('en-CA');
    return hoyString;
};
  // 💡 2. Obtener el ID numérico del día de hoy (1: Lunes, 2: Martes..., 7: Domingo)
const obtenerIdDiaHoy = () => {
    const hoy = new Date();
    const day = hoy.getDay(); // 0: Domingo, 1: Lunes...
    return day === 0 ? 7 : day;
};
const fechaHoyStr = obtenerFechaHoy();
const idDiaHoy = obtenerIdDiaHoy();
  // 💡 3. Filtrar las actividades que corresponden estrictamente a hoy
const actividadesDeHoy = actividades.filter((act) => {
    if (!act.dia_sugerido || !Array.isArray(act.dia_sugerido) || act.dia_sugerido.length === 0) return false;
    // Si es una rutina fija (ej: "2"), verificamos si coincide con el día de la semana de hoy
    if (act.dia_sugerido.map(Number).includes(idDiaHoy)) return true;
    // Si es una tarea con fecha completa, comparamos el string "YYYY-MM-DD" exacto
    return act.dia_sugerido.includes(fechaHoyStr);
});
    const Minutos_ocupadas = actividadesDeHoy.reduce((acum, actividad) => {
        return acum + actividad.duracion_minutos;
    },0);
    const Horas_ocupadas = Minutos_ocupadas/60;
    const META_ESTUDIO_MINUTOS = 600;
    const META_ESTUDIO_Horas = META_ESTUDIO_MINUTOS/60;
    const porcentajeOcupado = Math.min(Math.round((Minutos_ocupadas / META_ESTUDIO_MINUTOS) * 100), 100);


  // 💡 4. Ordenar de manera cronológica por hora de inicio
    actividadesDeHoy.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

    return (
    <div className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
            <div>
            <h2 className="text-sm font-bold text-slate-200">Cronograma de Hoy</h2>
            <p className="text-[10px] font-mono text-indigo-400 mt-0.5">{fechaHoyStr}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                {actividadesDeHoy.length} asignadas
            </span>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mx-10 mb-6 text-white">
    <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-300">Carga Académica Recomendada al dia ({META_ESTUDIO_Horas} Horas)</span>
        <span className="text-sm font-bold text-indigo-400">{porcentajeOcupado}%</span>
    </div>
    <div className="w-full bg-white/10 rounded-full h-3">
        <div 
            className="bg-indigo-500 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${porcentajeOcupado}%` }}
        ></div>
    </div>
    <p className="text-xs text-slate-400 mt-2">
        {porcentajeOcupado > 80 ? "⚠️ ¡Cuidado! Tu día está muy saturado." : "✅ Tu carga horaria de hoy es óptima."}
    </p>
</div>
        {/* LISTA VERTICAL COMPACTA */}
        <div className="flex flex-wrap md:flex-row gap-4 pb-2">
            {actividadesDeHoy.length > 0 ? (
            actividadesDeHoy.map((actividad) => (
            <div key={actividad.id} className="w-full md:w-70 shrink-0">
                <Actividad actividad={actividad} />
            </div>))
            ) : (
            <div className="py-12 text-center border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-slate-500 italic">✨ No hay actividades programadas para hoy</p>
            </div>
            )}
        </div>
    </div>
    );
}

export default ActividadHoy;