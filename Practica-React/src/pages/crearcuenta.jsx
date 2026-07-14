import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CrearCuenta() {
    const Servidor_Backend = import.meta.env.VITE_SERVIDOR_BACKEND || "http://localhost:3000";
    const navigate = useNavigate();
    const [mostrarPassword, setMostrarPassword] = useState(false);

const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
});
const [error, setError] = useState('');
const [cargando, setCargando] = useState(false);

const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validar que las contraseñas coincidan exactamente
    if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
    }

    // 2. 🔐 EXPRESIÓN REGULAR: Mínimo 8 caracteres, 1 Mayúscula, 1 Número y 1 Símbolo
    const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/]).{8,}$/;

    if (!regexPassword.test(form.password)) {
        setError('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial (ej: @, $, !, #).');
        return; // 🛑 Frena el registro aquí si es débil
    }

    setCargando(true);

    try {
        // 3. 🚀 PETICIÓN REAL AL BACKEND (Reemplaza al mock)
        const respuesta = await fetch(`${Servidor_Backend}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: form.name,
                email: form.email,
                password: form.password // Se envía plano, el backend lo encriptará con bcrypt
            }),
        });

        const resultado = await respuesta.json();

        if (resultado.status === 'OK') {
            // 4. Guardamos los datos reales devueltos en "user" para el RouteProtected
            const usuarioReal = {
                isLoggedIn: true,
                id_usuario: resultado.data.id_usuario, // 👈 Aquí viaja el correo real guardado como ID
                name: resultado.data.nombre,
                email: resultado.data.id_usuario
            };

            localStorage.setItem("user", JSON.stringify(usuarioReal));
            console.log("Cuenta creada y guardada con éxito en Railway.");
            
            // 5. Lo mandamos a la pantalla de inicio protegida
            navigate('/index'); 
        } else {
            // Captura errores controlados del backend (ej: "El correo ya está registrado")
            setError(resultado.message || 'Error al crear la cuenta.');
        }

    } catch (err) {
        console.error("Error conectando con el servidor:", err);
        setError('No se pudo establecer conexión con el servidor. Inténtalo más tarde.');
    } finally {
        setCargando(false);
    }
    };

return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4 text-slate-100 font-sans">
    <div className="w-full max-w-md bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 backdrop-blur-sm">
        
        <header className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Crear Cuenta
        </h1>
        </header>
        {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-medium animate-pulse">
            ⚠️ {error}
        </div>
        )}

        {/* FORMULARIO TRADICIONAL */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
            <label className="block text-slate-400 mb-1 font-medium">Nombre Completo</label>
            <input 
            type="text" 
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
            placeholder="Ej: Dylan Ch." 
            required 
            />
        </div>
    
        <div>
            <label className="block text-slate-400 mb-1 font-medium">Correo Electrónico</label>
            <input 
            type="email" 
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
            placeholder="tu_correo@estudiantes.edu" 
            required 
            />
        </div>
    
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
            <label className="block text-slate-400 mb-1 font-medium">Contraseña</label>
            <div className="relative">
                <input 
                    type={mostrarPassword? "text":"password"} 
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
                    placeholder="••••••••" 
                    required 
                />
                <button
                            type="button" // IMPORTANTE: pon "button" para que no intente enviar el formulario al hacer clic
                            onClick={() => setMostrarPassword(!mostrarPassword)} // Invierte el valor actual (de true a false, o de false a true)
                            className="absolute right-3 top-3 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer select-none"
                        >{mostrarPassword ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4" />}</button>
            </div>
            </div>
            <div>
            <label className="block text-slate-400 mb-1 font-medium">Confirmar</label>
            <input 
                type="password" 
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" 
                placeholder="••••••••" 
                required 
            />
            </div>
        </div>
    
        <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 transition-colors text-white font-bold py-2.5 rounded-xl mt-2 shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider"
        >
            {cargando ? 'Creando cuenta...' : 'Registrar Cuenta'}
        </button>
        </form>
    
        <footer className="text-center pt-2 border-t border-white/5">
        <p className="text-[11px] text-slate-400">
            ¿Ya eres miembro?{' '}
            <a href="/login" className="text-indigo-400 hover:underline font-semibold">Inicia Sesión</a>
        </p>
        </footer>
    
    </div>
    </div>
);
}

export default CrearCuenta;