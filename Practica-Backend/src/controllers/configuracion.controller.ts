import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RequestConUsuario } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();

// 1. OBTENER CONFIGURACIÓN (GET)
// Sirve para que cuando el usuario entre a la página, se carguen sus datos actuales
export const obtenerConfiguracionUsuario = async (req: RequestConUsuario, res: Response) => {
    try {
    const emailUsuario = req.usuario.id_usuario; // Extraído de forma segura desde el JWT

    const configuracion = await prisma.configuracion.findUnique({
        where: { usuarioId: emailUsuario }
    });

    // Si no tiene configuración (usuario nuevo), respondemos con OK pero configuracion null
    res.status(200).json({
        status: 'OK',
        configuracion
    });
    } catch (error) {
    console.error("Error al obtener configuración de Prisma:", error);
    res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor al cargar los horarios.' });
    }
};

// 2. CREAR O ACTUALIZAR CONFIGURACIÓN (POST)
// Maneja el guardado dinámico utilizando un "upsert"
export const guardarConfiguracionUsuario = async (req: RequestConUsuario, res: Response) => {
    try {
    const emailUsuario = req.usuario.id_usuario;
    
    // Desestructuramos todo el payload exacto que viene desde tu frontend en React
    const { ordenes_ia, nivel_estricto_ia, bloques_energia, hora_sueno_inicio, hora_sueno_fin } = req.body;

    // Convertimos el mapa de bloques de energía a un String JSON para que Prisma lo guarde en el campo de Texto
    const bloquesEnergiaString = JSON.stringify(bloques_energia);

    // Upsert busca por el '@unique' (usuarioId). Si lo encuentra, hace UPDATE. Si no, hace INSERT.
    const resultado = await prisma.configuracion.upsert({
        where: { usuarioId: emailUsuario },
        update: {
        ordenes_ia,
        nivel_estricto_ia,
        bloques_energia: bloquesEnergiaString,
        hora_sueno_inicio,
        hora_sueno_fin
        },
        create: {
        usuarioId: emailUsuario,
        ordenes_ia,
        nivel_estricto_ia,
        bloques_energia: bloquesEnergiaString,
        hora_sueno_inicio,
        hora_sueno_fin
        }
    });

    res.status(200).json({
        status: 'OK',
        message: 'Configuración guardada de manera exitosa.',
        configuracion: resultado
    });

    } catch (error) {
    console.error("Error al guardar configuración en Prisma:", error);
    res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor al guardar las preferencias.' });
    }
};