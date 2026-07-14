import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Inicializar cliente de Prisma
export const prisma = new PrismaClient();