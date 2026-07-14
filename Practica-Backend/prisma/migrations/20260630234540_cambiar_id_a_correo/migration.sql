/*
  Warnings:

  - You are about to drop the column `email` on the `usuarios` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `usuarios_email_key` ON `usuarios`;

-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `email`,
    ADD COLUMN `password` VARCHAR(191) NULL;
