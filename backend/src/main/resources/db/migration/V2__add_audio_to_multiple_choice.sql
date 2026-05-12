ALTER TABLE exercises
ADD COLUMN prompt_audio_id UUID REFERENCES audio_assets(id);

ALTER TABLE exercise_options
ADD COLUMN audio_id UUID REFERENCES audio_assets(id);
