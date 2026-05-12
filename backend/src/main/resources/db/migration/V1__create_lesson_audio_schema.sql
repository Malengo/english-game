CREATE TABLE lessons (
    id UUID PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    location_id VARCHAR(80),
    stage_required INTEGER NOT NULL DEFAULT 1,
    topic VARCHAR(80),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE audio_assets (
    id UUID PRIMARY KEY,
    text TEXT NOT NULL,
    voice VARCHAR(120) NOT NULL,
    language VARCHAR(20) NOT NULL,
    format VARCHAR(20) NOT NULL DEFAULT 'mp3',
    r2_key VARCHAR(500),
    public_url TEXT,
    duration_ms INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE lesson_items (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    audio_id UUID REFERENCES audio_assets(id),
    type VARCHAR(40) NOT NULL,
    text TEXT NOT NULL,
    translation TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    type VARCHAR(40) NOT NULL,
    correct_answer TEXT,
    order_index INTEGER NOT NULL
);

CREATE TABLE exercise_options (
    id UUID PRIMARY KEY,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INTEGER NOT NULL
);

CREATE INDEX idx_lessons_status ON lessons(status);
CREATE INDEX idx_lesson_items_lesson_id ON lesson_items(lesson_id);
CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX idx_exercise_options_exercise_id ON exercise_options(exercise_id);
