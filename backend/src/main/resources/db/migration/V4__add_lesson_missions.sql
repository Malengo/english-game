CREATE TABLE lesson_missions (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    npc_id VARCHAR(80) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_lesson_missions_lesson_id ON lesson_missions(lesson_id);


