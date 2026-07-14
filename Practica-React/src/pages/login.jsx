import React from "react";
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import user from "../../data/userdata.ts";
import { Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from "@react-oauth/google";
const users = user;
function Tarjeta_error(){
        return(
            <div className="flex flex-col bg-red-500/25 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center mt-4" role="alert">
                <div className="font-bold text-center">¡Error! </div>
                <div className="block sm:inline text-center">Credenciales incorrectas.</div>
                <div className="block sm:inline text-center">Intente de nuevo.</div>
            </div>
        )
    }
function Formulario_login({onLoginExitoso}){
    const Servidor_Backend = import.meta.env.VITE_SERVIDOR_BACKEND || "http://localhost:3000";
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);
    async function ValidarFormulario(nombre, password) {
    try {
    // 1. Buscamos primero en tu arreglo local de usuarios permitidos (como lo hacías antes)
    const User = users.find((item) => item.email === nombre && item.password === password);
    
    // 2. Si existe en tu lista, hacemos la petición real al backend usando su correo
    const respuesta = await fetch(`${Servidor_Backend}/api/auth/login-local`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        email: nombre, // Mandamos el correo asociado a ese usuario local
        password: password // La contraseña en texto plano (el backend se encarga de verificar el hash)
        }),
    });

    const resultado = await respuesta.json();

    if (resultado.status === 'OK') {
        // 3. Estructura idéntica que tu RouteProtected ya lee perfectamente
        const usuarioSesion = {
        isLoggedIn: true,
        id_usuario: resultado.data.id_usuario, 
        name: resultado.data.nombre,
        email: resultado.data.id_usuario
        };
    
        // 4. Guardamos en el localStorage y navegamos
        localStorage.setItem("user", JSON.stringify(usuarioSesion));
        localStorage.setItem("token_user", resultado.token)
        if (onLoginExitoso) {
            onLoginExitoso(); 
        }
        setError(false);
        navigate("/index");
    } else {
        // Si el backend rebota la autenticación por alguna razón
        setError(true);
    }
    } catch (err) {
    console.error("Error al conectar con el login local:", err);
    setError(true);
    }
}

    const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Token JWT de Google:", credentialResponse.credential);
        
    try {
    // 1. Aquí decodificamos el token de Google para enviárselo al backend.
    // Como Google envía un JWT, lo ideal es extraer los datos. 
    // Para no meter librerías extra, podemos decodificar el payload de forma nativa:
    const base64Url = credentialResponse.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const datosGoogle = JSON.parse(window.atob(base64));

    console.log("Datos extraídos de Google:", datosGoogle);

    // 2. Hacemos la petición real a tu endpoint de Node/Express
    const respuesta = await fetch(`${Servidor_Backend}/api/auth/login`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        id_usuario: datosGoogle.email,     // El "sub" es el ID único y eterno de Google para ese usuario
        nombre: datosGoogle.name
        }),
    });

    const resultado = await respuesta.json();

    if (resultado.status === 'OK') {
        // 3. Armando la estructura que tu RouteProtected ya espera
        const usuarioReal = {
        isLoggedIn: true,
        name: resultado.data.nombre,
        email: resultado.data.id_usuario
        };
    
        // 4. Lo guardamos en el localStorage exactamente con la llave "user"
        localStorage.setItem("user", JSON.stringify(usuarioReal));
        
        setError(false);
        console.log("Usuario autenticado en Railway y guardado en localStorage.");
        
        // 5. Redirigimos al index seguro
        navigate("/index");
        setError(true);
    }

    } catch (err) {
    setError(true);
    console.error('Error al conectar con el servidor backend:', err);
    }
};
    return(
        <div className="flex flex-col backdrop-blur-3xl bg-white/5 justify-center pl-10 pr-10 pt-8 pb-5 
            rounded-lg shadow-md w-full max-w-md "> 
                <h1 className="text-3xl font-bold bg-linear-to-r text-white 
                bg-clip-text text-center pb-5">Login</h1>

                <form className="flex flex-col" onSubmit={(e) => {
                    e.preventDefault();
                    ValidarFormulario(nombre, password);
                }}>
                    <label className="block text-xs font-medium text-slate-400 uppercase 
                    tracking-wider mb-1.5">Correo Electrónico :</label>
                    <input type="email" id="nombre" placeholder="Correo Electrónico" 
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 
                    text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 mb-4
                    focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                    value={nombre} onChange={(e) => setNombre(e.target.value)} />

                    <label className="block text-xs font-medium text-slate-400 uppercase 
                    tracking-wider mb-1.5">Contraseña :</label>
                    <div className="relative">
                    <input type={mostrarPassword ? "text" : "password"} id="password" placeholder="Contraseña" 
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-3 
                    text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 mb-4
                    focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button
                        type="button" // IMPORTANTE: pon "button" para que no intente enviar el formulario al hacer clic
                        onClick={() => setMostrarPassword(!mostrarPassword)} // Invierte el valor actual (de true a false, o de false a true)
                        className="absolute right-3 top-3 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer select-none"
                    >{mostrarPassword ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5" />}</button>
                    </div>

                    <button className="w-full bg-blue-950 
                    duration-200
                    hover:bg-indigo-500 
                    text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all 
                    shadow-lg shadow-indigo-600/30 active:scale-[0.98] cursor-pointer mt-2"
                    >Iniciar Sesión</button>
                    <div className="flex justify-center pt-5">
                        {/*<GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Error en la autenticación con Google')}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            text="signin_with"
                            locale="es"
                            data-use_fedcm="false"
                        />*/}
                    </div>
                </form>
                {error && <Tarjeta_error />}
                <Link to="/recuperar_cuenta" className="text-sm mt-4  
                font-bold transition-all duration-200
                bg-linear-to-r text-white bg-clip-text 
                text-center mb-2"><span className="hover:underline hover:text-indigo-950">¿Olvidaste tu contraseña?</span></Link>
            <p className="text-sm font-bold bg-linear-to-r
            text-white bg-clip-text 
            text-center mb-2">¿No tienes cuenta? 
            <Link to="/crear_cuenta" className="underline hover:text-indigo-950 
            transition-all duration-200">Regístrate</Link></p>
        </div>
    )
}
function Login({onLoginExitoso}) {
    return(
        <div className="bg-linear-to-br from-blue-900 to-blue-700 min-h-screen w-full flex flex-col items-center justify-center">
            <Formulario_login onLoginExitoso={onLoginExitoso}/>
        </div>
        
    );
}
export default Login;