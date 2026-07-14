import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles,
  Sliders,
  Activity,
  CalendarDays,
  LogOut,
  HomeIcon
} from 'lucide-react';
function Navbar({Cerrar_sesion}) {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = localStorage.getItem("user");
    const Info = JSON.parse(userInfo);  
  
    const enlaces = [
    { ruta: '/index', etiqueta: 'Home', icono: HomeIcon },
    { ruta: '/actividades', etiqueta: 'Actividades', icono: CalendarDays },
    { ruta: '/optimizacion', etiqueta: 'Optimización', icono: Activity },
    { ruta: '/configuracion', etiqueta: 'Configuracion', icono: Sliders }
    ];

    const claseEnlace = (ruta) => {
    const base = "flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ";
  
  if (location.pathname === ruta) {
    // Cuando está seleccionado: en móvil se expande y muestra color
    return base + "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 max-w-[140px]";
  }
  // Cuando NO está seleccionado: en móvil se encoge al mínimo (solo icono)
  return base + "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent max-w-[40px] sm:max-w-[140px]";
};

    return (
    <nav className="w-full bg-slate-950 border-b border-white/5 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50">
    
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/index')}>
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <Sparkles className="w-3 h-3 text-indigo-400" />
            </div>
            <span className="text-sm md:text-base hidden md:inline font-semibold tracking-wide text-slate-200">
                SmartAcademiTime
            </span>
        </div>


        <div className="flex items-center gap-1 md:gap-2">

        {enlaces.map((enlace) => {
            const Icono = enlace.icono;
            const esSeleccionado = location.pathname === enlace.ruta;
            return(
                <button 
                key={enlace.ruta}
                onClick={() => navigate(enlace.ruta)}
                className={`flex items-center gap-2 h-10 px-3 rounded-xl text-xs 
                    md:text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer group 
                    ${esSeleccionado
                  ? "bg-indigo-600/20 text-blue-700 border border-indigo-500/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
              }`}> 
                <Icono className="w-4 h-4 min-w-4 shrink-0" />
                <span className={`overflow-hidden transition-all duration-300 ease-in-out text-left whitespace-nowrap block ${esSeleccionado ? "max-w-25 opacity-100 font-semibold" : "max-w-0 opacity-50 sm:max-w-25 sm:opacity-100"}}`}>
                    {enlace.etiqueta}
                </span>
                </button>

                )
        }
        )}
        </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={Cerrar_sesion}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 min-w-4" />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </div>

    </nav>
  );
}

export default Navbar;