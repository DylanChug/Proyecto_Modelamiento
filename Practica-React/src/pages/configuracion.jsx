import react from 'react'
import Navbar2 from '../components/navbar2.jsx'
import Notification from '../components/Notification.jsx'    

function Configuracion({CerrarSesion}) {
  const Servidor_Backend = import.meta.env.VITE_SERVIDOR_BACKEND || "http://localhost:3000";
  const [guardadoExitoso, setGuardadoExitoso] = react.useState(false);
  const [cargando, setCargando] = react.useState(true); // 👈 Añadimos estado de carga inicial
  const [errorServidor, setErrorServidor] = react.useState('');

  const [config, setConfig] = react.useState({
    ordenes_ia: '',
    nivel_estricto_ia: 'moderado',
    bloques_energia: { 1: 'mañana', 2: 'mañana', 3: 'tarde', 4: 'tarde', 5: 'mañana', 6: 'libre', 7: 'libre' },
    hora_sueno_inicio: '23:00',
    hora_sueno_fin: '06:30'
  });

  // 🚀 1. TRAER LA CONFIGURACIÓN REAL AL MONTAR EL COMPONENTE
  react.useEffect(() => {
    const obtenerPreferencias = async () => {
      const token = localStorage.getItem("token_user");
      if (!token) return setCargando(false);

      try {
        const respuesta = await fetch(`${Servidor_Backend}/api/configuracion/horarios`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await respuesta.json();

        if (data.status === 'OK' && data.configuracion) {
          // El backend puede devolver bloques_energia como un string JSON si lo guardas así en Prisma
          const bloquesProcesados = typeof data.configuracion.bloques_energia === 'string'
            ? JSON.parse(data.configuracion.bloques_energia)
            : data.configuracion.bloques_energia;

          setConfig({
            ordenes_ia: data.configuracion.ordenes_ia || '',
            nivel_estricto_ia: data.configuracion.nivel_estricto_ia || 'moderado',
            bloques_energia: bloquesProcesados || config.bloques_energia,
            hora_sueno_inicio: data.configuracion.hora_sueno_inicio || '23:00',
            hora_sueno_fin: data.configuracion.hora_sueno_fin || '06:30'
          });
        }
      } catch (err) {
        console.error("Error al traer preferencias desde la BD:", err);
        setErrorServidor('No se pudo cargar la configuración de la nube.');
      } finally {
        setCargando(false);
      }
    };

    obtenerPreferencias();
  }, []);

  const handleEnergiaChange = (diaId, valor) => {
    setConfig(prev => ({
      ...prev,
      bloques_energia: { ...prev.bloques_energia, [diaId]: valor }
    }));
  };

  // 💾 2. GUARDAR LA CONFIGURACIÓN REAL EN LA BASE DE DATOS
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor('');
    const token = localStorage.getItem("token_user");

    console.log("Enviando configuración real a la BD:", config);
    
    try {
      const respuesta = await fetch(`${Servidor_Backend}/api/configuracion/horarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config) // Enviamos el objeto de configuración completo
      });

      const data = await respuesta.json();

      if (data.status === 'OK') {
        setGuardadoExitoso(true);
        setTimeout(() => setGuardadoExitoso(false), 3000);
      } else {
        setErrorServidor(data.message || 'Error al intentar guardar.');
      }
    } catch (err) {
      console.error("Error al persistir configuración:", err);
      setErrorServidor('Error de conexión con el servidor.');
    }
  };

  const DIAS = [
    { id: 1, label: 'Lunes' }, { id: 2, label: 'Martes' }, { id: 3, label: 'Miércoles' },
    { id: 4, label: 'Jueves' }, { id: 5, label: 'Viernes' }, { id: 6, label: 'Sábado' }, { id: 7, label: 'Domingo' }
  ];

  if (cargando) {
    return (
      <div className="p-6 bg-linear-to-r from-blue-900 to-blue-700 min-h-screen text-slate-100 flex items-center justify-center font-mono animate-pulse text-xs">
        Cargando tus preferencias de SmartIA...
      </div>
    );
  }

  return (
    <div>
      <Navbar2 Cerrar_sesion={CerrarSesion}/>
      <div className="p-6 bg-linear-to-r from-blue-900 to-blue-700 min-h-screen text-slate-100 flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
          
          <header className="border-b border-white/5 pb-4">
            <h1 className="text-2xl font-bold tracking-tight">Preferencias del Sistema e IA</h1>
            <p className="text-xs text-slate-400">Moldea el comportamiento de la SmartIA y define tus picos de rendimiento semanal.</p>
          </header>

          {errorServidor && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-mono">
              ⚠️ {errorServidor}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            
            {/* ================= SECCIÓN 1: ÓRDENES A LA IA ================= */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-200">Directrices Personalizadas para la IA</h2>
              </div>
              <p className="text-[11px] text-slate-400">Escribe en lenguaje natural reglas específicas que la IA deba respetar al agendar tus tareas.</p>
              
              <textarea
                value={config.ordenes_ia}
                onChange={(e) => setConfig({ ...config, ordenes_ia: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500 h-24 resize-none leading-relaxed"
                placeholder="Ej: Intenta dejar los bloques de la mañana del martes para desarrollo enfocado..."
              />

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-slate-400 mb-1">Rigidez de la Optimización</label>
                  <select 
                    value={config.nivel_estricto_ia} 
                    onChange={(e) => setConfig({ ...config, nivel_estricto_ia: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="relajado">Relajado (Prioriza descansos largos)</option>
                    <option value="moderado">Moderado (Equilibrio Productividad/Estrés)</option>
                    <option value="estricto">Productivo / Estricto (Bloques continuos de enfoque)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ================= SECCIÓN 2: PICOS DE ENERGÍA ================= */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-200">Cronograma de Energía Semanal</h2>
              </div>
              <p className="text-[11px] text-slate-400">¿En qué momento del día te sientes con más enfoque? La IA colocará las tareas complejas en tus horarios altos.</p>

              <div className="space-y-2">
                {DIAS.map(dia => (
                  <div key={dia.id} className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                    <span className="sm:col-span-3 font-semibold text-slate-300">{dia.label}</span>
                    
                    <div className="sm:col-span-9 grid grid-cols-4 gap-1">
                      {['mañana', 'tarde', 'noche', 'libre'].map(bloque => {
                        const activo = config.bloques_energia[dia.id] === bloque;
                        return (
                          <button
                            key={bloque}
                            type="button"
                            onClick={() => handleEnergiaChange(dia.id, bloque)}
                            className={`py-1.5 rounded-lg text-center font-bold font-mono text-[10px] uppercase transition-all border ${
                              activo 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                                : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10'
                            }`}
                          >
                            {bloque === 'libre' ? 'Libre' : bloque}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= SECCIÓN 3: SUEÑO ================= */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-200">Límites de Descanso Obligatorio</h2>
              </div>
              <p className="text-[11px] text-slate-400">Bloquea por completo estas horas. La IA tiene prohibido sugerir actividades en este rango.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Hora de ir a dormir</label>
                  <input 
                    type="time" 
                    value={config.hora_sueno_inicio} 
                    onChange={(e) => setConfig({ ...config, hora_sueno_inicio: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hora de despertar</label>
                  <input 
                    type="time" 
                    value={config.hora_sueno_fin} 
                    onChange={(e) => setConfig({ ...config, hora_sueno_fin: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* BOTÓN GUARDAR */}
            <div className="flex items-center justify-between pt-2">
              {guardadoExitoso && (
                <span className="text-green-400 font-bold animate-pulse">
                  ✓ Preferencias guardadas correctamente en la nube.
                </span>
              )}
              <button 
                type="submit" 
                className="ml-auto bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-600/20"
              >
                Guardar Configuración
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Configuracion;