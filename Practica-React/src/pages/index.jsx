import React from 'react';
import { 
    LayoutDashboard, 
    Calendar, 
    CheckSquare, 
    Settings, 
    LogOut, 
    Clock, 
    BookOpen, 
    Sparkles 
} from 'lucide-react';
import Navbar2 from '../components/navbar2';
import { useLocation , Navigate} from 'react-router-dom';
import Login from './login';
import Notification from '../components/Notification';
import actividadesEstrategiaFinalBD from '../../data/actividadesdata';
import ActividadHoy from '../components/actividades_hoy';
import HistorialMetricas from '../components/metricas';
function Index({Actividad, CerrarSesion}) {
    const Minutos_ocupadas = Actividad.reduce((acum, actividad) => {
        const duracion_actividad = () => {
            const dias = actividad.dia_sugerido.length;
            return actividad.duracion_minutos*dias;
        }
        return acum + duracion_actividad();
    },0);
    // Definimos una meta o límite máximo diario saludable (ej: 360 minutos = 6 horas)
    const META_ESTUDIO_MINUTOS = 360;
    const porcentajeOcupado = Math.min(Math.round((Minutos_ocupadas / META_ESTUDIO_MINUTOS) * 100), 100);
    const Actividades_Urgentes = Actividad.filter(act => act.prioridad === 'Critica').length;
    const Horas_ocupadas = (Minutos_ocupadas/60).toFixed(2);
    const Total_Actividades = Actividad.reduce((acum, actividad) => {
        const dias = actividad.dia_sugerido.length;
        return acum + dias;
    }, 0);
    const userInfo = localStorage.getItem("user");
    const Info = JSON.parse(userInfo);
    return (
        <div className="flex flex-col min-h-screen bg-linear-to-r from-blue-900 to-blue-700">
            <Navbar2 Cerrar_sesion={CerrarSesion}/>
            <header className="h-auto backdrop-blur-lg bg-black/50 border border-white/20 rounded-lg shadow-md flex items-center justify-around m-10 p-5">
                <div className="flex flex-col justify-center text-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Hola, <span className="font-bold text-indigo-400">{Info.name}</span>!</h1>
                    <p className="text-slate-400 text-sm mt-1">Este es el estado de tu optimización académica para hoy.</p>
                </div>
            </header>
            <div className="flex flex-wrap justify-center">
                <Notification Icono="Clock" Actividad="Horas de Actividades en los proximos 7 dias" Valor={`${Horas_ocupadas}`} Color="indigo" />
                <Notification Icono="BookOpen" Actividad="Actividades Pendientes" Valor={`${Total_Actividades} Actividades`} Color="green" />
                <Notification Icono="CheckSquare" Actividad="Actividades importantes" Valor={`${Actividades_Urgentes} importantes`} Color="red" />
            </div>
            <div className="flex flex-wrap justify-center p-4">
                    <ActividadHoy actividades={Actividad} />
            </div>
            <div className="flex flex-wrap justify-center p-4">
                <HistorialMetricas />
            </div>
        </div>

    )
}
export default Index;