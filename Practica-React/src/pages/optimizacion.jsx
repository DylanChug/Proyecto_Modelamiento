import react from 'react'
import Navbar2 from '../components/navbar2.jsx'
import Notification from '../components/Notification.jsx'
import actividadesEstrategiaFinalBD from '../../data/actividadesdata.js';
import Loading from '../components/cargando.jsx';
import PropuestaActividad from '../components/propuesta_actividad.jsx';
import axios from 'axios';
import RecomendacionIA from '../components/recomendacion_ia.jsx';
// 💡 Añadimos async a la firma si deseas manejar flujos internos de carga
function Error({ mensaje = 'Los datos del formulario no son correctos' }){
    return(
            <div className="flex flex-col bg-red-500/25 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center mt-4" role="alert">
                <div className="font-bold text-center">¡Error! </div>
                <div className="block sm:inline text-center">{mensaje}</div>
                <div className="block sm:inline text-center">Intente de nuevo.</div>
            </div>
        )
}
function Optimizacion({ actividades, OnGuardarActividad, OnEliminarActividad, CerrarSesion }) {
    const Servidor_Backend = import.meta.env.VITE_SERVIDOR_BACKEND;

    const DIAS = [
        { id: 1, nombre: 'Lunes' },
        { id: 2, nombre: 'Martes' },
        { id: 3, nombre: 'Miércoles' },
        { id: 4, nombre: 'Jueves' },
        { id: 5, nombre: 'Viernes' }, 
        { id: 6, nombre: 'Sábado' },
        { id: 7, nombre: 'Domingo' },
    ];

    const Verificardia = (dia_sugerido) => {
        if (!dia_sugerido || dia_sugerido.length === 0) return "No asignado";
        if (typeof dia_sugerido[0] === 'number') {
            const Dias = DIAS.filter(dia => dia_sugerido.includes(dia.id));
            const MostrarDias = Dias.map(dia => dia.nombre).join(", ");
            return MostrarDias;
        }
        if (typeof dia_sugerido[0] === 'string') {
            return dia_sugerido[0];
        }
    };

    const [editandoId, setEditandoId] = react.useState(null);
    const [isOptimizing, setIsOptimizing] = react.useState(false);
    const [mostrarModalIA, setMostrarModalIA] = react.useState(false);
    const [actividadProcesadaIA, setActividadProcesadaIA] = react.useState(null);
    const [notificacion, setNotificacion] = react.useState({ mostrar: false, mensaje: '', tipo: 'success' });
    const [errorFormulario, setErrorFormulario] = react.useState('');

    const fechaHoy = (() => {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    })();

    const [form, setForm] = react.useState({
        nombre: '', 
        descripcion: '', 
        tipo_actividad: 'TAREA',
        dia_sugerido: [], 
        hora_inicio: '', 
        hora_fin: '', 
        duracion_minutos: 0,
        prioridad: '', 
        dificultad: '', 
        nivel_estres: ''
    });

    react.useEffect(() => {
        if (form.tipo_actividad !== 'TAREA' && form.hora_inicio && form.hora_fin) {
            const [horaI, minI] = form.hora_inicio.split(':').map(Number);
            const [horaF, minF] = form.hora_fin.split(':').map(Number);

            const diferencia = (horaF * 60 + minF) - (horaI * 60 + minI);
            setForm(prev => ({ ...prev, duracion_minutos: diferencia > 0 ? diferencia : 0 }));
        } else if (form.tipo_actividad === 'TAREA') {
            setForm(prev => ({ ...prev, hora_inicio: '', duracion_minutos: 0 }));
        }
    }, [form.hora_inicio, form.hora_fin, form.tipo_actividad]);

    const validarFormulario = (datos) => {
        const nombreLimpio = (datos.nombre || '').trim();
        if (!nombreLimpio || nombreLimpio.length < 3) {
            return 'El nombre de la actividad debe tener al menos 3 caracteres.';
        }

        if (nombreLimpio.length > 80) {
            return 'El nombre no puede superar los 80 caracteres.';
        }

        const descripcionLimpia = (datos.descripcion || '').trim();
        if (descripcionLimpia.length > 250) {
            return 'La descripción no puede superar los 250 caracteres.';
        }

        const fechaSeleccionada = datos.dia_sugerido?.[0];
        if (fechaSeleccionada && fechaSeleccionada < fechaHoy) {
            return 'No puedes seleccionar una fecha del pasado.';
        }

        if (datos.tipo_actividad === 'RUTINA' && (!datos.dia_sugerido || datos.dia_sugerido.length === 0)) {
            return 'Debes seleccionar al menos un día para la rutina.';
        }

        if (datos.tipo_actividad !== 'TAREA') {
            if (!datos.hora_inicio || !datos.hora_fin) {
                return 'Debes completar la hora de inicio y la hora de fin.';
            }

            const [horaInicio, minutoInicio] = (datos.hora_inicio || '00:00').split(':').map(Number);
            const [horaFin, minutoFin] = (datos.hora_fin || '00:00').split(':').map(Number);
            const totalInicio = horaInicio * 60 + minutoInicio;
            const totalFin = horaFin * 60 + minutoFin;

            if (totalFin <= totalInicio) {
                return 'La hora de fin debe ser posterior a la hora de inicio.';
            }

            if (fechaSeleccionada === fechaHoy) {
                const ahora = new Date();
                const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
                const horaInicioActual = totalInicio;
                const horaFinActual = totalFin;

                if (horaInicioActual < horaActual) {
                    return 'La hora de inicio no puede ser anterior a la hora actual.';
                }

                if (horaFinActual <= horaInicioActual) {
                    return 'La hora de fin debe ser posterior a la hora de inicio.';
                }
            }
        }

        if (datos.tipo_actividad === 'TAREA') {
            if (!datos.hora_fin) {
                return 'Debes ingresar una hora límite para la tarea.';
            }

            const [horaFin, minutoFin] = (datos.hora_fin || '00:00').split(':').map(Number);
            const totalFin = horaFin * 60 + minutoFin;

            if (fechaSeleccionada === fechaHoy) {
                const ahora = new Date();
                const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

                if (totalFin <= horaActual) {
                    return 'La hora límite debe ser posterior a la hora actual.';
                }
            }
        }

        return '';
    };

    const handleChange = (e) => {
        const nuevoForm = { ...form, [e.target.name]: e.target.value };
        setForm(nuevoForm);
        setErrorFormulario(validarFormulario(nuevoForm));
    };

    const handleDiaToggle = (numDia) => {
        setForm(prev => {
            const diasActuales = prev.dia_sugerido;
            const nuevosDias = diasActuales.includes(numDia)
                ? diasActuales.filter(d => d !== numDia)
                : [...diasActuales, numDia].sort();
            const nuevoForm = { ...prev, dia_sugerido: nuevosDias };
            setErrorFormulario(validarFormulario(nuevoForm));
            return nuevoForm;
        });
    };

    const seleccionarParaEditar = (actividad) => {
        setEditandoId(actividad.id);
        setForm({
            nombre: actividad.nombre,
            descripcion: actividad.descripcion || '',
            tipo_actividad: actividad.tipo_actividad,
            dia_sugerido: actividad.dia_sugerido ? [...actividad.dia_sugerido] : [],
            hora_inicio: actividad.hora_inicio || '',
            hora_fin: actividad.hora_fin || '',
            duracion_minutos: actividad.duracion_minutos || 0,
            prioridad: actividad.prioridad || '',
            dificultad: actividad.dificultad ? actividad.dificultad.toString() : '',
            nivel_estres: actividad.nivel_estres || ''
        });
    };

    const limpiarFormulario = () => {
        setEditandoId(null);
        setErrorFormulario('');
        setForm({
            nombre: '', descripcion: '', tipo_actividad: 'TAREA',
            dia_sugerido: [], hora_inicio: '', hora_fin: '', duracion_minutos: 0,
            prioridad: '', dificultad: '', nivel_estres: ''
        });
    };

    // ⚡ CONTROLADOR DEL SUBMIT INTEGRADO CON LAS FUNCIONES ASÍNCRONAS DE APP.JSX
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errorValidacion = validarFormulario(form);
        if (errorValidacion) {
            setErrorFormulario(errorValidacion);
            return;
        }

        setErrorFormulario('');

        // Si es edición, pasamos su ID real numérico. Si es nuevo, dejamos que App/Prisma se lo asigne
        const datosBase = {
            ...(editandoId && { id: editandoId }),
            tipo_actividad: form.tipo_actividad,
            nombre: form.nombre,
            descripcion: form.descripcion,
            dia_sugerido: form.dia_sugerido,
            hora_fin: form.hora_fin,
            hora_inicio: form.tipo_actividad === 'TAREA' ? null : form.hora_inicio,
            duracion_minutos: form.tipo_actividad === 'TAREA' ? null : form.duracion_minutos,
            prioridad: form.prioridad || null,
            dificultad: form.dificultad ? parseInt(form.dificultad, 10) : null,
            nivel_estres: form.nivel_estres || null,
            descanso_posterior: false
        };

        // 🧠 CASO 1: Es una TAREA NUEVA -> Requiere pasar primero por la IA (Modal de Aprobación)
if (form.tipo_actividad === 'TAREA' && !editandoId) {
    setIsOptimizing(true);
    
    // Ejecutamos de forma asíncrona la petición real al backend
    (async () => {
        try {
            // Recuperamos el token de sesión para la autenticación
            const token = localStorage.getItem('token_user');

            // 🚀 Petición real al motor de optimización que creamos en el Back
            const respuesta = await axios.post(
                `${Servidor_Backend}/api/optimizacion/generar-propuesta`, 
                {
                    titulo: datosBase.nombre,          // Traducimos al nombre que espera tu back controller
                    descripcion: datosBase.descripcion,
                    duracion_minutos: datosBase.duracion_minutos || 120, // Por si no lo puso, un default
                    prioridad: datosBase.prioridad,
                    dificultad: datosBase.dificultad
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (respuesta.data.status === 'OK') {
                const sugerenciaIA = respuesta.data.propuesta;

                // Armamos el objeto final mapeándolo para que tu modal "PropuestaActividad" lo lea nativamente
                const resultadoIA = {
                    ...datosBase,
                    dia_sugerido: sugerenciaIA.dia_sugerido, 
                    hora_inicio: sugerenciaIA.hora_inicio,
                    hora_fin: sugerenciaIA.hora_fin,
                    duracion_minutos: sugerenciaIA.duracion_minutos || datosBase.duracion_minutos,
                    prioridad: sugerenciaIA.prioridad || datosBase.prioridad,
                    dificultad: sugerenciaIA.dificultad || datosBase.dificultad,
                    nivel_estres: sugerenciaIA.nivel_estres,
                    justificacion_pedagogica: sugerenciaIA.justificacion_pedagogica,
                    descanso_posterior: sugerenciaIA.descanso_posterior
                };

                // Guardamos la respuesta real en el estado y abrimos tu modal espectacular
                setActividadProcesadaIA(resultadoIA);
                setMostrarModalIA(true);
            }

        } catch (error) {
            console.error("Error real en el motor de optimización:", error);
            alert(error.response?.data?.message || "No se pudo conectar con el motor de IA.");
        } finally {
            // Quitamos el estado de carga pase lo que pase
            setIsOptimizing(false); 
        }
    })();
    } else {
            // 📝 CASO 2: Es un EVENTO/RUTINA o una EDICIÓN DIRECTA (No requiere modal IA preliminar)
            setIsOptimizing(true);
            const datosDirectos = {
                ...datosBase,
                dia_sugerido: form.dia_sugerido,
                hora_inicio: form.hora_inicio,
                duracion_minutos: form.duracion_minutos,
                descanso_posterior: false
            };
            
            const res = await OnGuardarActividad(datosDirectos);
            setIsOptimizing(false);

            if (res?.status === 'OK') {
                setNotificacion({ mostrar: true, mensaje: '¡Actividad sincronizada exitosamente!', tipo: 'success' });
                limpiarFormulario();
            } else {
                setNotificacion({ mostrar: true, mensaje: `Error: ${res?.message || 'No se pudo guardar'}`, tipo: 'error' });
            }
        }
    };

    // 🟢 CONFIRMACIÓN DESDE EL MODAL DE LA IA (Guarda la Tarea en la Base de Datos)
    const confirmarPropuestaIA = async () => {
        setMostrarModalIA(false);
        setIsOptimizing(true);

        const res = await OnGuardarActividad(actividadProcesadaIA);
        setIsOptimizing(false);

        if (res?.status === 'OK') {
            setNotificacion({ mostrar: true, mensaje: '¡Sugerencia de IA guardada en la base de datos!', tipo: 'success' });
            setActividadProcesadaIA(null);
            limpiarFormulario();
        } else {
            setNotificacion({ mostrar: true, mensaje: `Error al guardar la tarea: ${res?.message}`, tipo: 'error' });
        }
    };

    return (
        <div className="bg-linear-to-r from-blue-900 to-blue-700 min-h-screen">
            <Navbar2 Cerrar_sesion={CerrarSesion}/>
            
            <div className="w-full p-10 max-w-6xl mx-auto space-y-6">
                <main className="flex flex-wrap justify-center gap-6">
                    
                    {/* FORMULARIO */}
                    <div className="w-full md:w-112.5 bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h2 className="text-sm font-bold text-slate-200">
                                {editandoId ? 'Editar Actividad' : 'Crear Nueva Actividad'}
                            </h2>
                            {editandoId && (
                                <button onClick={limpiarFormulario} className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-400 hover:text-slate-200">
                                    Cancelar
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-400 mb-1">Nombre de la actividad</label>
                                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} maxLength={80} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" placeholder="Ej: Refactorización de Navbar" required />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1">Descripción / Notas</label>
                                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} maxLength={250} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 h-16 resize-none" placeholder="Detalles de la entrega o materia..." />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1">Tipo de Actividad</label>
                                <select name="tipo_actividad" value={form.tipo_actividad} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500">
                                    <option value="TAREA">TAREA (Optimizado por IA)</option>
                                    <option value="RUTINA">RUTINA (Horario Fijo)</option>
                                    <option value="FIJA"> EVENTO (Horario Fijo)</option>
                                </select>
                            </div>

                            {form.tipo_actividad === 'TAREA' ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-slate-400 mb-1">Fecha de Entrega:</label>
                                            <input 
                                                type="date" 
                                                min={fechaHoy}
                                                value={form.dia_sugerido[0] || ''} 
                                                onChange={(e) => {
                                                    const nuevoForm = { ...form, dia_sugerido: [e.target.value] };
                                                    setForm(nuevoForm);
                                                    setErrorFormulario(validarFormulario(nuevoForm));
                                                }}
                                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs" 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 mb-1">Hora Límite:</label>
                                            <input type="time" name="hora_fin" value={form.hora_fin} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500" required />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-slate-400 text-[11px] flex items-center gap-2">
                                        <span>✨</span>
                                        <p>La **SmartIA** distribuirá la tarea en tus bloques libres automáticamente <strong>antes</strong> del plazo configurado.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        {form.tipo_actividad === 'RUTINA' ? (
                                            <div>
                                                <label className="block text-slate-400 mb-1.5">Días de ejecución recurrente</label>
                                                <div className="flex justify-between gap-1">
                                                    {[
                                                        { id: 1, label: 'L' }, { id: 2, label: 'M' }, { id: 3, label: 'X' },
                                                        { id: 4, label: 'J' }, { id: 5, label: 'V' }, { id: 6, label: 'S' }, { id: 7, label: 'D' }
                                                    ].map(dia => {
                                                        const activo = form.dia_sugerido.includes(dia.id);
                                                        return (
                                                            <button
                                                                key={dia.id}
                                                                type="button"
                                                                onClick={() => handleDiaToggle(dia.id)}
                                                                className={`w-full py-2 rounded-xl text-center font-bold font-mono text-[11px] transition-all border ${
                                                                    activo 
                                                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                                                                        : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                                                                }`}
                                                            >
                                                                {dia.label}
                                                            </button>
                                                        );
                                                    })} 
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-slate-400 mb-1">Fecha de Evento</label>
                                                <input 
                                                    type="date" 
                                                    min={fechaHoy}
                                                    value={form.dia_sugerido[0] || ''} 
                                                    onChange={(e) => {
                                                        const nuevoForm = { ...form, dia_sugerido: [e.target.value] };
                                                        setForm(nuevoForm);
                                                        setErrorFormulario(validarFormulario(nuevoForm));
                                                    }}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs" 
                                                    required 
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-slate-400 mb-1">Hora Inicio</label>
                                            <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 mb-1">Hora Fin</label>
                                            <input type="time" name="hora_fin" value={form.hora_fin} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none" required />
                                        </div>
                                    </div>
                                    {form.duracion_minutos > 0 && (
                                        <div className="text-right text-[11px] text-indigo-400 font-mono">
                                            ⏱️ Duración por sesión: {form.duracion_minutos} minutos
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 mb-1">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                    Parámetros de Optimización (Opcional)
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-slate-400 mb-1 text-[11px]">Prioridad</label>
                                    <select name="prioridad" value={form.prioridad} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-slate-200 focus:outline-none text-xs">
                                        <option value="">Automatico</option>
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1 text-[11px]">Dificultad</label>
                                    <select name="dificultad" value={form.dificultad} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-slate-200 focus:outline-none text-xs">
                                        <option value="">Automatico</option>
                                        <option value="1">1 (Fácil)</option>
                                        <option value="2">2 (Medio)</option>
                                        <option value="3">3 (Complejo)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1 text-[11px]">Estrés Mental</label>
                                    <select name="nivel_estres" value={form.nivel_estres} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-slate-200 focus:outline-none text-xs">
                                        <option value="">Automatico</option>
                                        <option value="Ligero">Ligero</option>
                                        <option value="Moderado">Moderado</option>
                                        <option value="Alto">Alto</option>
                                    </select>
                                </div>
                            </div>
                            {errorFormulario && <Error mensaje={errorFormulario} />}
                            <button type="submit" disabled={isOptimizing} className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-bold py-2.5 rounded-xl mt-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50">
                                {editandoId ? 'Guardar Cambios' : 'Registrar Actividad'}
                            </button>
                        </form>
                    </div>

                    {/* LISTADO DE ACTIVIDADES REGISTRADAS */}
                    <div className="flex-1 min-w-75 bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tus Actividades Registradas</h3>
                        <div className="space-y-2 max-h-112.5 overflow-y-auto pr-1">
                            {actividades.length === 0 ? (
                                <p className="text-xs text-slate-500 font-mono text-center py-4">No hay actividades en la base de datos.</p>
                            ) : (
                                actividades.map((act) => (
                                    <div key={act.id} className="p-2.5 bg-slate-900/60 border border-white/5 rounded-xl flex items-center justify-between text-xs hover:border-white/10 transition-colors">
                                        <div>
                                            <p className="font-bold text-slate-200">{act.nombre}</p>
                                            <p className="text-[10px] text-slate-500">
                                                {act.hora_inicio ? `${act.hora_inicio} - ${act.hora_fin}` : 'Planificado por IA'} | {Verificardia(act.dia_sugerido)}
                                            </p>
                                        </div>
                                        <div className="flex gap-4">
                                        <button onClick={() => seleccionarParaEditar(act)} className="text-xs font-bold text-indigo-700 hover:text-indigo-200 px-2 py-1 rounded bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition-all">
                                            Editar
                                        </button>
                                        <button onClick={() => OnEliminarActividad(act.id)} // O act.id_actividad, dependiendo de tu mapeo del GET
                                            className="bg-red-500/50 hover:bg-red-600/80 text-white p-2 rounded-md transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>
                {/* RECOMENDACIONES SMARTIA */}
                <RecomendacionIA actividades={actividades}/>            
            </div>

            <Loading isOpen={isOptimizing} />
            <PropuestaActividad 
                isOpen={mostrarModalIA} 
                actividad={actividadProcesadaIA} 
                onConfirmar={confirmarPropuestaIA}
                onCancelar={() => {setMostrarModalIA(false); }}
                onRegenerar={() => {setMostrarModalIA(false); handleSubmit;
                }}
            />
        </div>
    );
}

export default Optimizacion;