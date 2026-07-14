import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Index from './pages/index.jsx';
import Login from './pages/login.jsx';
import Optimización from './pages/optimizacion.jsx';
import Configuracion from './pages/configuracion.jsx';
import CrearCuenta from './pages/crearcuenta.jsx';
import RecuperarPassword from './pages/recuperarpassword.jsx';
import Actividades from './pages/actividades.jsx';
import axios from 'axios';

// 🛡️ 1. SACAMOS EL GUARDIÁN AFUERA DEL COMPONENTE APP
// Ahora es un componente puro y estático. React ya no lo destruirá al renderizar.
function RouteProtected() {
  const token = localStorage.getItem("token_user");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

function App() {
  const Servidor_Backend = import.meta.env.VITE_SERVIDOR_BACKEND || 'http://localhost:3000';
  const [actividades, setActividades] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [sesionActiva, setSesionActiva] = useState(!!localStorage.getItem("token_user"));

  // 🚀 2. EL EFFECT AHORA VIVE EN APP Y SÓLO CORRE SI HAY UNA SESIÓN ACTIVA
  // En App.jsx, modifica tu useEffect actual por este:
useEffect(() => {
  const token = localStorage.getItem("token_user");
  
  // 🛡️ El candado: Si físicamente no hay un token guardado en el storage, abortamos
  if (!token) {
    setActividades([]);
    return; 
  }

  const traerActividades = async () => {
    setCargandoDatos(true);
    try {
      console.log("🔗 Realizando fetch de actividades...");
      const respuesta = await fetch(`${Servidor_Backend}/api/actividades/mis-actividades`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await respuesta.json();
      if (data.status === 'OK') {
        setActividades(data.actividades || []);
      } else {
        console.error("Error en la respuesta del backend:", data.message);
      }
    } catch (err) {
      console.error('No se pudo conectar con el servidor.', err);
    } finally {
      setCargandoDatos(false); 
    }
  };

  traerActividades();
  
  // 🔄 Agregamos sesionActiva para que reaccione al login instantáneo
}, [sesionActiva]); // 🔄 Escucha si la sesión cambia (al loguearse o cerrar sesión)

  // 💡 Guardar o editar actividades de forma reactiva
  const handleGuardarActividad = async (nuevaActividad) => {
    const token = localStorage.getItem("token_user");
    if (!token) return { status: 'ERROR', message: 'Sesión expirada.' };

    const esEdicion = nuevaActividad.id && typeof nuevaActividad.id === 'number';

    try {
      const url = esEdicion 
        ? `${Servidor_Backend}/api/actividades/actualizar-actividad` 
        : `${Servidor_Backend}/api/actividades/crear-actividad`;
        
      const metodo = esEdicion ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevaActividad)
      });

      const data = await respuesta.json();

      if (data.status === 'OK') {
        const actividadProcesada = data.actividad;
        setActividades((prev) => {
        if (esEdicion) {
          const nuevaLista = prev.map(act => act.id == actividadProcesada.id ? actividadProcesada : act);
          return nuevaLista;
        } else {
      return [...prev, actividadProcesada];
    }
  });
  return { status: 'OK', actividad: actividadProcesada };
}
      return { status: 'ERROR', message: data.message };
    } catch (err) {
      return { status: 'ERROR', message: 'No se pudo conectar con el servidor.' };
    }
  };

  const eliminarActividad = async (idActividad) => {
    const token = localStorage.getItem("token_user");
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta actividad?")) return;

    try {
      const respuesta = await axios.delete(`${Servidor_Backend}/api/actividades/eliminar-actividad/${idActividad}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (respuesta.data.status === 'OK') {
        setActividades((prev) => prev.filter(act => act.id !== idActividad));
        alert("Actividad de la agenda eliminada.");
      }
    } catch (error) {
      console.error("Error al eliminar la actividad:", error);
    }
  };

  const manejarCerrarSesion = () => {
    localStorage.clear();
    setSesionActiva(false); // 🔒 Esto apaga el candado del useEffect
    setActividades([]);        
  };

  // El manejador que debes pasarle a tu componente de Login cuando sea exitoso
  const manejarLoginExitoso = () => {
    setSesionActiva(true); // 🔓 Esto enciende el useEffect para traer la agenda
  };

  if (cargandoDatos) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-indigo-400 font-mono">
        ⚡ SmartIA: Sincronizando agenda permanente...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 🔓 Rutas Públicas */}
        <Route path="/" element={<Login onLoginExitoso={manejarLoginExitoso} />} />
        <Route path="/crear_cuenta" element={<CrearCuenta />} />
        <Route path="/recuperar_cuenta" element={<RecuperarPassword />} />
        
        {/* 🔐 Rutas Protegidas */}
        <Route element={<RouteProtected />}>
          <Route path="/index" element={<Index Actividad={actividades} CerrarSesion={manejarCerrarSesion} />} />
          <Route path="/configuracion" element={<Configuracion CerrarSesion={manejarCerrarSesion} />} />
          <Route path="/actividades" element={<Actividades actividadesData={actividades} CerrarSesion={manejarCerrarSesion} />} />
          <Route path="/optimizacion" element={
            <Optimización actividades={actividades} OnGuardarActividad={handleGuardarActividad} OnEliminarActividad={eliminarActividad} CerrarSesion={manejarCerrarSesion}/>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;