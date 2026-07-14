import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
const JWT_Secret = process.env.CONTRASENIA_JWT || 'default_secret_key'; // Asegúrate de tener una clave secreta en tu archivo .env
const resend = new Resend(process.env.RESEND_API_KEY);
    // 1. LOGIN / REGISTRO CON GOOGLE
export const autenticarUsuario = async (req: Request, res: Response) => {
        try {
        const { id_usuario, nombre } = req.body; // id_usuario aquí es el correo que manda el front
    
        if (!id_usuario || !nombre) {
            return res.status(400).json({ 
            status: 'ERROR', 
            message: 'Faltan campos obligatorios: id_usuario (correo) o nombre.' 
            });
        }
    
        // Generamos un hash seguro por defecto usando su propio correo como semilla
        const saltRounds = 10;
        const passwordPorDefecto = await bcrypt.hash(`GoogleAuth2026_${id_usuario}`, saltRounds);
    
        // Si ya existe, actualiza el nombre. Si no existe, lo crea con la contraseña autogenerada
        const usuario = await prisma.usuario.upsert({
            where: { id_usuario },
            update: { nombre },
            create: { 
            id_usuario, 
            nombre,
            password: passwordPorDefecto
            }
        });
        
        const token = jwt.sign({   
            id_usuario: usuario.id_usuario, 
            nombre: usuario.nombre }, 
            JWT_Secret! 
        )

        res.status(200).json({
            status: 'OK',
            message: 'Usuario autenticado correctamente con Google.',
            token,
            data: { id_usuario: usuario.id_usuario, nombre: usuario.nombre }
        });
        } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error en la autenticación de Google.',
            error: error instanceof Error ? error.message : error
        });
        }
    };

    // 2. LOGIN TRADICIONAL (USUARIO Y CONTRASEÑA)
export const loginLocal = async (req: Request, res: Response) => {
        try {
        const { email, password } = req.body;
    
        if (!email || !password) {
            return res.status(400).json({ status: 'ERROR', message: 'Faltan correo o contraseña.' });
        }
    
        // Buscar al usuario en Railway usando el correo (id_usuario)
        const usuario = await prisma.usuario.findUnique({ where: { id_usuario: email } });
        if (!usuario) {
            return res.status(404).json({ status: 'ERROR', message: 'El usuario no existe.' });
        }
    
        // Verificar si la contraseña coincide con el hash guardado
        const passwordValido = await bcrypt.compare(password, usuario.password!);
        if (!passwordValido) {
            return res.status(401).json({ status: 'ERROR', message: 'Contraseña incorrecta.' });
        }
        
        const token = jwt.sign({   
            id_usuario: usuario.id_usuario, 
            nombre: usuario.nombre }, 
            JWT_Secret! 
        )
        res.status(200).json({
            status: 'OK',
            message: 'Inicio de sesión tradicional exitoso.',
            token,
            data: { id_usuario: usuario.id_usuario, nombre: usuario.nombre }
        });
        } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error en el login local.',
            error: error instanceof Error ? error.message : error
        });
        }
    };

    // 3. REGISTRO TRADICIONAL (CREAR USUARIO)
export const registrarUsuarioLocal = async (req: Request, res: Response) => {
        try {
        const { email, nombre, password } = req.body;
    
        // 1. Validaciones básicas de seguridad en el backend
        if (!email || !nombre || !password) {
            return res.status(400).json({ 
            status: 'ERROR', 
            message: 'Faltan campos obligatorios: email, nombre o password.' 
            });
        }
    
        // 2. Verificar si el correo ya existe en Railway
        const usuarioExiste = await prisma.usuario.findUnique({ where: { id_usuario: email } });
        if (usuarioExiste) {
            return res.status(400).json({ 
            status: 'ERROR', 
            message: 'El correo electrónico ya se encuentra registrado.' 
            });
        }
    
        // 3. Encriptar la contraseña con Bcrypt antes de guardarla
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
    
        // 4. Crear el registro en la base de datos usando el correo como ID
        const nuevoUsuario = await prisma.usuario.create({
            data: {
            id_usuario: email,
            nombre,
            password: hashedPassword
            }
        });
    
        // 5. Responder al frontend con los datos limpios (sin la contraseña)
        res.status(201).json({
            status: 'OK',
            message: 'Usuario registrado con éxito en Railway.',
            data: { 
            id_usuario: nuevoUsuario.id_usuario, 
            nombre: nuevoUsuario.nombre 
            }
        });
    
        } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno en el servidor al registrar el usuario.',
            error: error instanceof Error ? error.message : error
        });
        }
    };

    // 4. ENVIAR CÓDIGO DE VERIFICACIÓN POR CORREO Y CAMBIAR CONTRASEÑA

    // Objeto temporal en memoria para almacenar los códigos de verificación
const codigosVerificacion: Record<string, string> = {};

// =========================================================================
// 1. ENVIAR CÓDIGO DE VERIFICACIÓN POR CORREO
// =========================================================================
export const enviarCodigoRecuperacion = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: 'ERROR', message: 'El correo es obligatorio.' });
        }

        // Verificar si el usuario existe en tu base de datos de Railway/Prisma
        const usuario = await prisma.usuario.findUnique({ where: { id_usuario: email } });
        if (!usuario) {
            return res.status(404).json({ status: 'ERROR', message: 'El correo electrónico no está registrado.' });
        }

        // Generar un código aleatorio de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Guardamos el código asociado al email en memoria
        codigosVerificacion[email] = codigo;

        // Enviar el email real usando el SDK de Resend
        const { data, error } = await resend.emails.send({
            // 💡 Si usas el dominio gratuito de Resend, el remitente DEBE ser "onboarding@resend.dev"
            from: 'Soporte Laboratorio <soporte@compraprogramadadg.com>',
            to: email,
            subject: '🔑 Código de Recuperación de Contraseña',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #333; border-bottom: 2px solid #0070f3; padding-bottom: 10px;">Recuperación de Contraseña</h2>
                <p>Hola <strong>${usuario.nombre || 'Usuario'}</strong>,</p>
                <p>Has solicitado restablecer tu contraseña para acceder al sistema. Usa el siguiente código de verificación de un solo uso:</p>
                <div style="background-color: #f4f5f6; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0070f3; border-radius: 6px; margin: 20px 0; border: 1px dashed #0070f3;">
                    ${codigo}
                </div>
                <p style="font-size: 12px; color: #777; line-height: 1.5;">Este código es de uso temporal y confidencial. Si no solicitaste este cambio, puedes ignorar este correo de manera segura.</p>
            </div>
            `
        });

        if (error) {
            console.error("❌ Error devuelto por Resend:", error);
            throw new Error(error.message);
        }

        console.log(`📧 Código enviado con éxito a ${email}. ID de Resend:`, data?.id);

        res.status(200).json({
            status: 'OK',
            message: 'Código de verificación enviado al correo electrónico con éxito.'
        });

    } catch (error) {
        console.error("❌ Error interno al enviar correo:", error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al enviar el correo electrónico.',
            error: error instanceof Error ? error.message : error
        });
    }
};

// =========================================================================
// 2. VERIFICAR CÓDIGO Y CAMBIAR CONTRASEÑA EN RAILWAY
// =========================================================================
export const verificarCodigoYCambiarPassword = async (req: Request, res: Response) => {
    try {
        const { email, codigo, nuevaPassword } = req.body;

        if (!email || !codigo || !nuevaPassword) {
            return res.status(400).json({ status: 'ERROR', message: 'Faltan campos obligatorios.' });
        }

        // Validar que el código coincida con el guardado en memoria
        if (!codigosVerificacion[email] || codigosVerificacion[email] !== codigo) {
            return res.status(400).json({ status: 'ERROR', message: 'El código de verificación es incorrecto o ha expirado.' });
        }

        // Encriptar la nueva contraseña con bcrypt
        const hashedNewPassword = await bcrypt.hash(nuevaPassword, 10);

        // Actualizar la contraseña en la base de datos a través de Prisma
        await prisma.usuario.update({
            where: { id_usuario: email },
            data: { password: hashedNewPassword }
        });

        // Limpiar el código usado de la memoria por seguridad
        delete codigosVerificacion[email];

        res.status(200).json({
            status: 'OK',
            message: 'Contraseña actualizada correctamente en la base de datos.'
        });

    } catch (error) {
        console.error("❌ Error interno al reestablecer password:", error);
        res.status(500).json({ 
            status: 'ERROR', 
            message: 'Error interno al actualizar la contraseña.' 
        });
    }
};