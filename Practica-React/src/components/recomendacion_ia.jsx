import react from 'react';
import { useState } from 'react';
import axios from 'axios';
import ModalReoptimizar from './propuesta_optimizacion';

function RecomendacionIA({ actividades }) {
    const Servidor_Backend = import.meta.env.VITE_SERVIDOR_BACKEND;

    const [cargandoReopt, setCargandoReopt] = useState(false);
    const [mostrarModalReopt, setMostrarModalReopt] = useState(false);
    const [agendaSugeridaIA, setAgendaSugeridaIA] = useState(null);

    const ejecutarReoptimizacionCadena = async () => {
        // 🛡️ Validación previa: Si en el front ya sabemos que no hay nada, ahorramos el viaje al servidor
        if (!actividades || actividades.length === 0) {
        alert("✨ ¡Tu agenda ya está perfectamente optimizada! No tienes actividades o conflictos registrados para reordenar.");
        return;
        }
    
        setCargandoReopt(true);
        try {
        const token = localStorage.getItem("token_user");
        
        const respuesta = await axios.post(`${Servidor_Backend}/api/optimizacion/reoptimizar-semana`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    
        if (respuesta.data.status === 'OK') {
            const cambios = respuesta.data.agenda_reoptimizada;
        
            // 🤖 Validación posterior: Si la IA procesó pero determinó que no hacía falta mover nada
            if (!cambios || cambios.length === 0) {
            alert("✨ SmartIA: ¡Tu agenda ya está optimizada! No se detectaron colisiones ni espacios encimados con tus rutinas fijas.");
            return;
            }
        
            // Si sí hay cambios en cadena, guardamos y abrimos el modal creado
            setAgendaSugeridaIA(cambios);
            setMostrarModalReopt(true);
        
        } else {
            alert("La IA no pudo procesar la agenda: " + respuesta.data.message);
        }
        } catch (error) {
        console.error("Error al calcular el efecto dominó:", error);
        alert("Hubo un error de red al conectar con el motor de optimización.");
        } finally {
        setCargandoReopt(false);
        }
    };
        return (
            <div className="bg-linear-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 p-5 rounded-2xl shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🤖</span>
                    <h2 className="text-sm font-bold text-indigo-400 tracking-wide uppercase">Recomendaciones de SmartIA</h2>
                </div>
                <div className="space-y-3">
                  {/* Tarjeta de Conflicto Activo */}
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs flex justify-between items-center">
                        <div>
                            <p className="font-bold text-slate-200">Aqui podrás optimizar tu calendario en caso de tener conflictos de horarios con actividades</p>
                        </div>
                        {/* BOTÓN CONECTADO: Desencadena el flujo y cambia de texto al cargar */}
                        <button 
                            onClick={ejecutarReoptimizacionCadena}
                            disabled={cargandoReopt}
                            className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 ml-4 transition-colors disabled:opacity-50"
                        >
                            {cargandoReopt ? "Calculando..." : "Optimizar"}
                        </button>
                    </div>
                        {/* Bloque de sugerencia pasiva */}
                </div>
                <ModalReoptimizar 
                    isOpen={mostrarModalReopt} // 👈 Debe cambiar a true
                    agendaReoptimizada={agendaSugeridaIA} // 👈 Debe recibir el arreglo de la IA
                    onClose={() => setMostrarModalReopt(false)}
                    onExito={() => {
                      // Aquí refrescas tu calendario principal llamando de nuevo a la API si quieres
                        console.log("Agenda actualizada en la vista principal");
                    }}
                />
            </div>
        )
    }

export default RecomendacionIA;