-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "profiles"
ADD COLUMN "account_role" "AccountRole" NOT NULL DEFAULT 'USER';
