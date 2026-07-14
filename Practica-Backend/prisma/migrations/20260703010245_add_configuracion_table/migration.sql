/*
  Warnings:

  - Made the column `password` on table `usuarios` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `usuarios` MODIFY `password` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Configuracion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` VARCHAR(191) NOT NULL,
    `ordenes_ia` TEXT NOT NULL,
    `nivel_estricto_ia` VARCHAR(191) NOT NULL DEFAULT 'moderado',
    `bloques_energia` TEXT NOT NULL,
    `hora_sueno_inicio` VARCHAR(191) NOT NULL DEFAULT '23:00',
    `hora_sueno_fin` VARCHAR(191) NOT NULL DEFAULT '06:30',
    `fecha_actualizacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Configuracion_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Configuracion` ADD CONSTRAINT `Configuracion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
