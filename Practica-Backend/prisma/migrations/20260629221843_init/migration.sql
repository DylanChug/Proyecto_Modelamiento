-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `foto_url` TEXT NULL,
    `creado_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actividades` (
    `id_actividad` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Pendiente',
    `dia_sugerido` TEXT NOT NULL,
    `hora_inicio` VARCHAR(5) NOT NULL,
    `hora_fin` VARCHAR(5) NOT NULL,
    `duracion_minutos` INTEGER NOT NULL,
    `fecha_entrega` DATETIME(3) NOT NULL,
    `prioridad` VARCHAR(191) NOT NULL DEFAULT 'Media',
    `dificultad` INTEGER NOT NULL,
    `nivel_estres` VARCHAR(191) NOT NULL,
    `justificacion_pedagogica` TEXT NULL,
    `descanso_posterior` BOOLEAN NOT NULL DEFAULT false,
    `creado_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_at` DATETIME(3) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_actividad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_metricas` (
    `id_historial` INTEGER NOT NULL AUTO_INCREMENT,
    `periodo` VARCHAR(191) NOT NULL,
    `horas_estudio` DOUBLE NOT NULL DEFAULT 0.0,
    `horas_libre_ganadas` DOUBLE NOT NULL DEFAULT 0.0,
    `tareas_completadas` INTEGER NOT NULL DEFAULT 0,
    `id_usuario` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `historial_metricas_periodo_id_usuario_key`(`periodo`, `id_usuario`),
    PRIMARY KEY (`id_historial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `actividades` ADD CONSTRAINT `actividades_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_metricas` ADD CONSTRAINT `historial_metricas_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
