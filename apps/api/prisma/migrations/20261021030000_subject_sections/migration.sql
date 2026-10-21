-- Replace the subject-only identity with a subject offering identity.
DROP INDEX "subjects_code_term_key";

ALTER TABLE "subjects"
ADD COLUMN "section" TEXT NOT NULL DEFAULT 'BSCS 1-A';

ALTER TABLE "subjects"
ALTER COLUMN "section" DROP DEFAULT;

CREATE UNIQUE INDEX "subjects_code_section_term_key"
ON "subjects"("code", "section", "term");
