import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ServidorBackend = import.meta.env.VITE_SERVIDOR_BACKEND;

function RecuperarPassword() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1); 
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSolicitarCodigo = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');
        setCargando(true);

        try {
            const respuesta = await fetch(`${ServidorBackend}/api/auth/solicitar-codigo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            const data = await respuesta.json();

            if (data.status === 'OK') {
                setMensaje('Código de verificación enviado. Revisa tu correo electrónico.');
                setPaso(2);
            } else {
                setError(data.message || 'El correo electrónico no está registrado.');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    const handleFinalizarRecuperacion = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        // 1. Validar coincidencia de claves
        if (nuevaPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        // 2. Expresión regular de seguridad idéntica a tu Registro
        const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/]).{8,}$/;
        if (!regexPassword.test(nuevaPassword)) {
            setError('La clave debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.');
            return;
        }

        setCargando(true);

        try {
            const respuesta = await fetch(`${ServidorBackend}/api/auth/confirmar-codigo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    codigo: codigo.trim(),
                    nuevaPassword
                }),
            });
            const data = await respuesta.json();

            if (data.status === 'OK') {
                setMensaje('🎉 ¡Contraseña restablecida con éxito! Redirigiendo...');
                setTimeout(() => {
                    navigate('/login'); // Regresa al Login tradicional
                }, 2500);
            } else {
                setError(data.message || 'Código incorrecto o expirado.');
            }
        } catch (err) {
            setError('Error al procesar la solicitud.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4 text-slate-100 font-sans">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 backdrop-blur-sm">
                
                <header className="text-center space-y-1">
                    <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                        {paso === 1 ? 'Recuperar Contraseña' : 'Restablecer Clave'}
                    </h1>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        {paso === 1 
                            ? 'Ingresa tu correo electrónico registrado y te enviaremos un código de verificación de 6 dígitos.' 
                            : `Ingresa el código enviado a ${email} junto con tu nueva contraseña.`
                        }
                    </p>
                </header>

                {/* Feedback */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {mensaje && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-center font-medium">
                        {mensaje}
                    </div>
                )}

                {/* PASO 1: FORMULARIO DE CORREO */}
                {paso === 1 ? (
                    <form onSubmit={handleSolicitarCodigo} className="space-y-4 text-xs">
                        <div>
                            <label className="block text-slate-400 mb-1 font-medium">Correo Electrónico</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
                                placeholder="tu_correo@estudiantes.edu" 
                                required 
                                disabled={cargando}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={cargando}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 transition-colors text-white font-bold py-2.5 rounded-xl mt-2 shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider"
                        >
                            {cargando ? 'Buscando cuenta...' : 'Enviar código'}
                        </button>
                    </form>
                ) : (
                    /* PASO 2: FORMULARIO DE CÓDIGO Y NUEVA CLAVE */
                    <form onSubmit={handleFinalizarRecuperacion} className="space-y-4 text-xs">
                        <div>
                            <label className="block text-slate-400 mb-1 font-medium">Código de Verificación</label>
                            <input 
                                type="text" 
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-center text-lg tracking-widest font-bold" 
                                placeholder="000000" 
                                maxLength="6"
                                required 
                                disabled={cargando}
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-1 font-medium">Nueva Contraseña</label>
                            <input 
                                type="password" 
                                value={nuevaPassword}
                                onChange={(e) => setNuevaPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
                                placeholder="••••••••" 
                                required 
                                disabled={cargando}
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-1 font-medium">Confirmar Contraseña</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
                                placeholder="••••••••" 
                                required 
                                disabled={cargando}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={cargando}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 transition-colors text-white font-bold py-2.5 rounded-xl mt-2 shadow-lg shadow-emerald-600/20 text-xs uppercase tracking-wider"
                        >
                            {cargando ? 'Actualizando clave...' : 'Restablecer Contraseña'}
                        </button>

                        <button 
                            type="button"
                            onClick={() => { setPaso(1); setError(''); setMensaje(''); }}
                            className="w-full text-[10px] text-slate-400 hover:text-slate-200 transition-colors text-center font-medium mt-1"
                        >
                            ← Modificar correo ingresado
                        </button>
                    </form>
                )}

                <footer className="text-center pt-2 border-t border-white/5">
                    <button 
                        type="button"
                        onClick={() => navigate('/login')} 
                        className="text-[11px] text-indigo-400 hover:underline font-semibold bg-transparent border-none cursor-pointer"
                    >
                        ← Volver al Inicio de Sesión
                    </button>
                </footer>

            </div>
        </div>
    );
}

export default RecuperarPassword;