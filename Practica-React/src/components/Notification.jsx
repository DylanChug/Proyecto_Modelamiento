import '../index.css';
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

function Notification({Icono, Actividad, Valor, Color}){
    function Icon(){
        switch(Icono){
            case "Clock":
                return (<Clock />);
            case "BookOpen":
                return (<BookOpen />);
            case "CheckSquare":
                return (<CheckSquare />);
            default:
                return (<Sparkles />);
        }
    }
    return(
        <div className={`bg-white/80 border border-white/10 p-5 rounded-2xl flex items-center gap-4 w-full max-w-sm shadow-md m-5`}>
            <div className="p-3 bg-black/10 border border-indigo-500/20 rounded-xl text-indigo-500">
                <Icon />
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">{Actividad}</p>
                {Valor && <p className="text-xl font-bold mt-0.5">{Valor}</p>}
            </div>
        </div>
    );
}
export default Notification;