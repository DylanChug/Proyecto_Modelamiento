import React from 'react';

function Loading({ isOpen }) {
    if (!isOpen) return null;

    return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
        <div className="relative flex items-center justify-center mb-4">
        {/* Spinner de Tailwind */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="absolute text-xl animate-pulse">🤖</span>
        </div>
        <h3 className="text-sm font-bold text-slate-200 tracking-wide">SmartIA Analizando tu Agenda...</h3>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs text-center">
        Buscando colisiones, midiendo niveles de estrés y localizando tu mejor bloque de tiempo libre.
        </p>
    </div>
    );
}

export default Loading;
