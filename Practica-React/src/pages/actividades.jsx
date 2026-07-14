import react from 'react'
import Navbar2 from '../components/navbar2.jsx'
import Notification from '../components/Notification.jsx'
import Actividad from '../components/actvidad.jsx'
import actividadesEstrategiaFinalBD from '../../data/actividadesdata.ts'
import CalendarioDia from '../components/calendario_dia.jsx'
function Actividades({actividadesData, CerrarSesion}) {
    const obtenerFechaHoy = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
    };
    const [semanaActiva, setSemanaActiva] = react.useState(obtenerFechaHoy());
    const irASemanaAnterior = () => {
        setSemanaActiva(actual => moverSemana(actual, -1));
    };
    const irASemanaSiguiente = () => {
        setSemanaActiva(actual => moverSemana(actual, 1));
    };
// Función para mover semanas hacia adelante o atrás (+7 días o -7 días)
    const moverSemana = (fechaStr, semanasAMover) => {
        const fecha = new Date(`${fechaStr}T12:00:00`);
        fecha.setDate(fecha.getDate() + (semanasAMover * 7));
        return fecha.toISOString().split('T')[0];
    };
    const Rutinas = actividadesData.filter((actividad) => actividad.tipo_actividad === "RUTINA");
    const Tareas = actividadesData.filter((actividad) => actividad.tipo_actividad === "TAREA");
    const Eventos = actividadesData.filter((actividad) => actividad.tipo_actividad === "EVENTO");
    return(
        <div className='flex flex-col min-h-screen bg-linear-to-t from-blue-500 to-blue-900'>
            <Navbar2 Cerrar_sesion={CerrarSesion}/>
            <CalendarioDia actividades={actividadesData} semana={semanaActiva}/>
        </div>
    );
}
export default Actividades;