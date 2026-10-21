CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(4000),
    "due_at" TIMESTAMP(3),
    "points" INTEGER,
    "subject_id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learning_materials" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(4000),
    "url" VARCHAR(2048) NOT NULL,
    "subject_id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_materials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tasks_subject_id_due_at_idx" ON "tasks"("subject_id", "due_at");
CREATE INDEX "learning_materials_subject_id_created_at_idx" ON "learning_materials"("subject_id", "created_at");

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learning_materials"
ADD CONSTRAINT "learning_materials_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learning_materials"
ADD CONSTRAINT "learning_materials_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Application access is mediated by the authenticated Express API.
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning_materials" ENABLE ROW LEVEL SECURITY;
