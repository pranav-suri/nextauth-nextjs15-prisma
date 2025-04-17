-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive', 'archived');

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "available_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
